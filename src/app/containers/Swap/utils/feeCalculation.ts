/**
 * Fee calculation utilities
 * Moved from bridge-app/src/app/core/appUtils.ts
 */

import { BigNumber as EthersBigNumber, utils as ethersUtils } from 'ethers';

const GWEI_IN_ETH = 10 ** 9;
const RELAY_COSTS_IN_GAS = 120000;

export interface GasPrice {
  type: any;
  hex: string;
}

export interface GasPriceItem {
  lastBaseFeePerGas?: GasPrice;
  maxFeePerGas?: GasPrice;
  maxPriorityFeePerGas?: GasPrice;
  gasPrice?: GasPrice;
}

export interface RelayFeeParams {
  baseCurrencyPriceInUSD: number;
  currencyPriceInUSD: number;
  gasPrice: number;
  currencyDecimals: number;
}

export interface GasPriceResponse {
  [network: string]: GasPriceItem;
}

export interface RatesApiResponse {
  [currency: string]: {
    usd: number;
  };
}

/**
 * Calculate relayer fee based on gas prices and exchange rates
 * @param params - Fee calculation parameters
 * @returns Relayer fee in BEAM
 */
export function calcRelayFee(params: RelayFeeParams): number {
  const relayCostsInUSD = (RELAY_COSTS_IN_GAS * params.gasPrice * params.baseCurrencyPriceInUSD) / GWEI_IN_ETH;
  const RELAY_SAFETY_COEFF = 2;
  const result = (RELAY_SAFETY_COEFF * relayCostsInUSD) / params.currencyPriceInUSD;

  return result;
}

// Arbitrum orders by arrival, not by tip: maxPriorityFeePerGas in the payload is
// ethers' generic 1.5 gwei default and is not actually paid there. Adding it would
// inflate the relayer fee ~75x, since Arbitrum's gasPrice is ~0.02 gwei.
// Matches both 'arbitrum' and 'arbitrum-sepolia' keys in /bridges/gasprices.
function ignoresPriorityFee(network?: string): boolean {
  return !!network && network.startsWith('arbitrum');
}

/**
 * Extract gas price from fee data
 *
 * `/bridges/gasprices` returns ethers' FeeData per network:
 * { lastBaseFeePerGas, maxFeePerGas, maxPriorityFeePerGas, gasPrice } as hex BigNumbers.
 * We build the estimate from `gasPrice` (eth_gasPrice — base fee plus whatever tip the
 * node's oracle sees) rather than `maxFeePerGas`, because ethers derives the latter as
 * `lastBaseFeePerGas * 2 + maxPriorityFeePerGas`, which double-counts headroom the
 * relayer does not spend.
 *
 * @param feeData - Gas price data from API
 * @param network - Network key from the gasprices payload (e.g. 'arbitrum', 'ethereum')
 * @returns Gas price in Gwei
 */
export function getGasPrice(feeData: GasPriceItem, network?: string): number {
  // Parse hex-encoded wei values safely (no JS number precision issues).
  const baseWei = EthersBigNumber.from(feeData.gasPrice?.hex ?? 0);
  const rawPriorityWei = EthersBigNumber.from(feeData.maxPriorityFeePerGas?.hex ?? 0);
  const priorityWei = ignoresPriorityFee(network) ? EthersBigNumber.from(0) : rawPriorityWei;

  // Apply safety factor (1.2x) using integer math; ceil to avoid underestimating.
  const baseWithSafetyWei = baseWei.mul(12).add(9).div(10);
  const totalWei = baseWithSafetyWei.add(priorityWei);

  // Convert wei -> gwei as a float for downstream USD fee calc.
  const totalGwei = parseFloat(ethersUtils.formatUnits(totalWei, 9));

  return totalGwei;
}

/**
 * Fetch gas prices from API
 */
export async function loadGasPricesApiCall(): Promise<GasPriceResponse | null> {
  try {
    const API_URL = 'https://explorer-api.beam.mw/bridges';
    const response = await fetch(`${API_URL}/gasprices`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load gas prices:', error);
    return null;
  }
}

/**
 * Fetch exchange rates from API
 */
export async function loadRatesCached(): Promise<RatesApiResponse | null> {
  try {
    const API_URL = 'https://explorer-api.beam.mw/bridges';
    const response = await fetch(`${API_URL}/rates`);
    if (response.status === 200) {
      return await response.json();
    }
    return null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load rates:', error);
    return null;
  }
}

/**
 * Calculate relayer fees for all networks
 * @param rates - Exchange rates
 * @param currencyRateId - Currency rate ID (e.g., 'beam')
 * @param ethRateId - Ethereum rate ID (e.g., 'ethereum')
 * @returns Map of network to relayer fee
 */
export async function calculateRelayerFees(
  rates: RatesApiResponse,
  currencyRateId: string,
  ethRateId: string,
  currencyDecimals: number = 8,
): Promise<Record<string, number>> {
  const gasPricesResponse = await loadGasPricesApiCall();
  if (!gasPricesResponse) {
    return {};
  }

  const currencyRateUSD = rates?.[currencyRateId]?.usd;
  const baseRateUSD = rates?.[ethRateId]?.usd;

  if (!currencyRateUSD || !baseRateUSD) {
    // eslint-disable-next-line no-console
    console.warn('Missing rates, cannot compute relay fees', {
      currencyRateId,
      currencyRateUSD,
      baseRateId: ethRateId,
      baseRateUSD,
    });
    return {};
  }

  const fees = Object.entries(gasPricesResponse).map(([network, gasPriceValue]) => {
    const gasPrice = getGasPrice(gasPriceValue, network);

    const feeParams: RelayFeeParams = {
      gasPrice,
      currencyPriceInUSD: currencyRateUSD,
      baseCurrencyPriceInUSD: baseRateUSD,
      currencyDecimals,
    };

    const relayFee = calcRelayFee(feeParams);
    return [network, relayFee];
  });

  return Object.fromEntries(fees);
}
