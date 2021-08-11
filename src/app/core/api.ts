import WasmWallet from './WasmWallet';
import { RPCMethod } from './types';

const sendRequest = (method: RPCMethod, params?: any): void => {
  WasmWallet.getInstance().send(method, params);
};

export const getWalletStatus = () => {
  sendRequest(RPCMethod.GetWalletStatus);
};

export const createAddress = () => {
  sendRequest(RPCMethod.CreateAddress);
};

export interface CalculateChangeParams {
  amount: number;
  asset_id: number;
  fee: number;
  is_push_transaction: boolean;
}

export const calculateChange = (params: CalculateChangeParams) => {
  sendRequest(RPCMethod.CalculateChange, params);
};

export interface SendTransactionParams {
  value: number;
  fee?: number;
  from?: string;
  address: string;
  comment?: string;
  asset_id?: number;
  offline?: boolean;
}

export const sendTransaction = (params: SendTransactionParams) => {
  sendRequest(RPCMethod.Send, params);
};
