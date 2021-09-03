import { sendRequest } from '@app/model';

import {
  AddressValidation, ChangeData, RPCMethod, WalletStatus,
} from './types';

export function getWalletStatus() {
  return sendRequest<WalletStatus>(RPCMethod.GetWalletStatus);
}

export function createAddress() {
  sendRequest(RPCMethod.CreateAddress);
}

export function validateAddress(address: string) {
  return sendRequest<AddressValidation>(RPCMethod.ValidateAddress, { address });
}

export interface CalculateChangeParams {
  amount: number;
  asset_id: number;
  fee: number;
  is_push_transaction: boolean;
}

export function calculateChange(params: CalculateChangeParams) {
  return sendRequest<ChangeData>(RPCMethod.CalculateChange, params);
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
  return sendRequest(RPCMethod.SendTransaction, params);
}
