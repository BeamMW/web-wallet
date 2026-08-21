import {
  postMessage, invokeContract, createInternalAppAPI, processInvokeData,
} from '@app/core/api';
import { RPCMethod } from '@app/core/types';
import { BEAM_ADDRESS_LENGTH } from '../constants';

/**
 * Direct Beam wallet API calls (without utils.js since we're already in the wallet)
 */

export interface BeamBridgeAddress {
  address: string;
  networkIndicator: string;
}

export interface SendToParams {
  // Prefer the raw decimal string from the input — see toBaseUnits().
  amount: number | string;
  address: string; // Beam address (66 hex chars) without network indicator
  fee: number;
  decimals: number;
  cid: string; // Contract ID
}

// Contract IDs by network (from bridge-app)
export const CID_BY_NETWORK: Record<string, string> = {
  1: 'e63bd26ca5b226558686dd191122a8e5d6861a97597db9f40bda48aef6dbe835', // Ethereum
  42161: 'd2505213880d87a4747d23036a02d8919be211d26266cd6f3e591536e44f27fe', // Arbitrum
};

const SWAP_APP_URL = 'beam-swap-internal';
const SWAP_APP_NAME = 'BEAM Swap';

// Longest-first: 'arbsep' must be tested before 'arb', otherwise an
// arbsep… address matches 'arb' and only 3 chars get stripped.
const NETWORK_INDICATORS = ['arbsep', 'eth', 'arb', 'sep'];

let wasmBytes: Uint8Array | null = null;

/**
 * Load pipe_app.wasm and create app API for contract invocation
 */
/**
 * Format Beam bridge address (remove network indicator)
 */
export function formatBeamAddress(address: string): string {
  // Remove network indicators like "eth" or "arb" from the end
  const indicators = NETWORK_INDICATORS;
  const foundPrefix = indicators.find((indicator) => address.startsWith(indicator));
  if (foundPrefix) {
    return address.slice(foundPrefix.length);
  }

  const found = indicators.find((indicator) => address.endsWith(indicator));
  if (found) {
    return address.slice(0, -found.length);
  }
  return address;
}

/**
 * Build a Beam bridge address with a network indicator prefix.
 */
export function buildBeamBridgeAddress(beamAddress: string, indicator: string): string {
  const trimmed = beamAddress.trim();
  if (!trimmed || !indicator) {
    return trimmed;
  }
  return `${indicator}${trimmed}`;
}

async function getSwapAppAPI(): Promise<{ wasmBytes: Uint8Array }> {
  // Return cached if available
  if (wasmBytes) {
    return { wasmBytes };
  }

  // Load pipe_app.wasm from assets
  // The WASM file is in the extension's assets folder (copied by webpack)
  try {
    const wasmUrl = typeof chrome !== 'undefined' && chrome.runtime
      ? chrome.runtime.getURL('assets/pipe_app.wasm')
      : '/assets/pipe_app.wasm';

    const response = await fetch(wasmUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch pipe_app.wasm: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    wasmBytes = new Uint8Array(buffer);
    return { wasmBytes };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load pipe_app.wasm:', error);
    throw error;
  }
}

/**
 * Load public key for a contract using pipe_app.wasm
 */
export async function loadPublicKey(cid: string): Promise<string> {
  try {
    // Ensure app API is created before invoking contract
    await createInternalAppAPI(SWAP_APP_URL, SWAP_APP_NAME);

    const { wasmBytes: bytes } = await getSwapAppAPI();

    if (!bytes) {
      throw new Error('Failed to load pipe_app.wasm');
    }

    // Invoke contract to get public key using @core/api
    const contractInvoke = `role=user,action=get_pk,cid=${cid}`;

    const result = await invokeContract({
      args: contractInvoke,
      contract: Array.from(bytes),
      create_tx: false,
      appurl: SWAP_APP_URL,
      appname: SWAP_APP_NAME,
    });

    // Parse the result
    if (result && result.output) {
      try {
        const shaderAnswer = JSON.parse(result.output);
        if (shaderAnswer.error) {
          throw new Error(shaderAnswer.error);
        }
        if (shaderAnswer.pubkey) {
          return shaderAnswer.pubkey;
        }
        throw new Error('No pubkey in result');
      } catch (parseError: any) {
        throw new Error(`Failed to parse contract result: ${parseError.message || parseError}`);
      }
    }
    throw new Error('No output in result');
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('Failed to load public key:', error);
    throw error;
  }
}

const DECIMAL_PATTERN = /^-?\d*(\.\d*)?$/;

/**
 * Convert a decimal amount to integer base units, as a decimal string.
 *
 * The result stays a string all the way into the contract args: for an 18-decimal
 * token any amount >= ~9 produces more than 2^53 base units, so returning a JS
 * number here would silently round the value.
 *
 * Pass the amount as a string wherever one is available (e.g. straight from a text
 * input). A `number` argument has already lost precision beyond ~17 significant
 * digits before it ever reaches this function, and nothing here can recover it.
 */
export function toBaseUnits(value: number | string, dec: number): string {
  let decimalText: string;

  if (typeof value === 'string') {
    decimalText = value.trim();
    if (!decimalText || !DECIMAL_PATTERN.test(decimalText)) {
      throw new Error(`Invalid amount: ${value}`);
    }
  } else {
    if (!Number.isFinite(value)) {
      throw new Error(`Invalid amount: ${value}`);
    }
    if (Math.abs(value) >= 1e21) {
      // toFixed() switches to exponential notation past this point.
      throw new Error(`Amount out of range: ${value}`);
    }
    decimalText = value.toFixed(dec);
  }

  const negative = decimalText.startsWith('-');
  const [intPart, fracPart = ''] = (negative ? decimalText.slice(1) : decimalText).split('.');
  // Extra fractional digits are below the token's resolution — truncate, never round up.
  const padded = fracPart.padEnd(dec, '0').slice(0, dec);

  // BigInt normalises leading zeros and keeps full precision at any width.
  const units = BigInt(`${intPart || '0'}${padded}`);
  return (negative ? -units : units).toString();
}

/**
 * Send funds via bridge contract
 */
export async function sendTo(params: SendToParams): Promise<any> {
  const {
    amount, address, fee, decimals, cid,
  } = params;
  // Match bridge-app approach: calculate 10^decimals and multiply
  const decimalsNum = typeof decimals === 'number' ? decimals : parseInt(String(decimals), 10);

  const finalAmount = toBaseUnits(amount, decimalsNum);
  const relayerFee = toBaseUnits(fee, decimalsNum);

  try {
    // Ensure app API is created before invoking contract
    await createInternalAppAPI(SWAP_APP_URL, SWAP_APP_NAME);

    const { wasmBytes: bytes } = await getSwapAppAPI();

    if (!bytes) {
      throw new Error('Failed to load pipe_app.wasm');
    }

    // Invoke contract to send funds using @core/api
    // Match bridge-app format: use numbers directly in the string
    const contractInvoke = [
      'role=user',
      'action=send',
      `cid=${cid}`,
      `amount=${finalAmount}`,
      `receiver=${address}`,
      `relayerFee=${relayerFee}`,
    ].join(',');

    const result = await invokeContract({
      args: contractInvoke,
      contract: Array.from(bytes),
      create_tx: false, // Don't create tx yet - we'll process it manually like bridge-app
      appurl: SWAP_APP_URL,
      appname: SWAP_APP_NAME,
    });

    if (result && result.raw_data) {
      await processInvokeData(SWAP_APP_URL, result.raw_data);
    }

    return result;
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('Failed to send via bridge contract:', error);
    throw error;
  }
}

/**
 * Load incoming transactions
 */
export async function loadIncoming(): Promise<any[]> {
  // Contract invocation to view incoming transactions
  return [];
}

/**
 * Get wallet address (public key) from bridge contract
 * Uses pipe_app.wasm to get the public key from the contract
 */
export async function getWalletAddress(networkId: string = '42161'): Promise<string> {
  try {
    const cid = CID_BY_NETWORK[networkId];
    if (!cid) {
      throw new Error(`Unknown network ID: ${networkId}`);
    }

    // Get public key from contract using pipe_app.wasm
    const pubkey = await loadPublicKey(cid);

    if (!pubkey) {
      throw new Error('Failed to get public key from contract');
    }

    // Format address to remove network indicator if present
    return formatBeamAddress(pubkey);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to get wallet address from contract:', error);
    // Fallback to regular address list if contract fails
    try {
      const addresses = await postMessage(RPCMethod.GetAddressList, {});
      if (addresses && addresses.length > 0) {
        return formatBeamAddress(addresses[0].address);
      }
    } catch (fallbackError) {
      // eslint-disable-next-line no-console
      console.error('Fallback address fetch also failed:', fallbackError);
    }
    return '';
  }
}

/**
 * Parse bridge address to extract Beam address and network indicator
 */
export function parseBridgeAddress(fullAddress: string): BeamBridgeAddress | null {
  const indicators = NETWORK_INDICATORS;
  const trimmed = fullAddress.trim();

  if (!trimmed) {
    return null;
  }

  // Prefer prefix-style indicators (eth + beam address)
  const prefix = indicators.find((indicator) => trimmed.startsWith(indicator));
  if (prefix) {
    const address = trimmed.slice(prefix.length);
    if (address.length === BEAM_ADDRESS_LENGTH && /^[0-9a-fA-F]+$/.test(address)) {
      return { address, networkIndicator: prefix };
    }
  }

  // Fallback to suffix-style indicators for backward compatibility
  const suffix = indicators.find((indicator) => trimmed.endsWith(indicator));
  if (suffix) {
    const address = trimmed.slice(0, -suffix.length);
    if (address.length === BEAM_ADDRESS_LENGTH && /^[0-9a-fA-F]+$/.test(address)) {
      return { address, networkIndicator: suffix };
    }
  }

  // If no indicator, assume it's just the Beam address
  if (trimmed.length === BEAM_ADDRESS_LENGTH && /^[0-9a-fA-F]+$/.test(trimmed)) {
    return {
      address: trimmed,
      networkIndicator: '',
    };
  }

  return null;
}
