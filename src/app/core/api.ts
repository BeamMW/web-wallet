import { createEvent } from 'effector';
import {
  AddressValidation, ChangeData, RPCMethod, WalletStatus,
  RPCEvent,
} from './types';
import WalletController from './WalletController';
import { WalletEvent } from './WasmWallet';

const walletController = WalletController.getInstance();

export const sendWalletEvent = createEvent<WalletEvent>();

export function handleWalletEvent<E>(event: RPCEvent | RPCMethod, handler: (payload: E) => void) {
  sendWalletEvent.filterMap(({ id, result }) => (
    id === event ? result as E : undefined
  ))
    .watch(handler);
}

export function sendRequest<T = any, P = unknown>(method: RPCMethod, params?: P): Promise<T> {
  return new Promise(async (resolve) => {
    const target = await walletController.sendRequest({ method, params });
    console.info(`sending ${method}:${target}`);

    const unwatch = sendWalletEvent
      .filter({
        fn: ({ id }) => id === target,
      })
      .watch(({ result }) => {
        console.info(`received ${method}:${target} with`, result);

        resolve(result);
        unwatch();
      });
  });
}

export function getWalletStatus() {
  return sendRequest<WalletStatus>(RPCMethod.GetWalletStatus);
}

export function createAddress() {
  return sendRequest<string>(RPCMethod.CreateAddress);
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
