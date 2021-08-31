import WasmWallet from './WasmWallet';
import { RPCMethod } from './types';

const sendRequest = (method: RPCMethod, params?: unknown): void => {
  WasmWallet.getInstance().send(method, params);
};

export function getWalletStatus() {
  sendRequest(RPCMethod.GetWalletStatus);
}

export function createAddress() {
  sendRequest(RPCMethod.CreateAddress);
}

export interface CalculateChangeParams {
  amount: number;
  asset_id: number;
  fee: number;
  is_push_transaction: boolean;
}

export function calculateChange(params: CalculateChangeParams) {
  sendRequest(RPCMethod.CalculateChange, params);
}

export function validateAddress(address: string) {
  sendRequest(RPCMethod.ValidateAddress, { address });
}

export interface SendTransactionParams {
  value: number;
  fee?: number;
  from?: string;
  address: string;
  comment?: string;
  asset_id?: number;
  offline?: boolean;
}

export function sendTransaction(params: SendTransactionParams) {
  sendRequest(RPCMethod.Send, params);
}
