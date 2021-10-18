import { createEvent, Subscription } from 'effector';
import * as extensionizer from 'extensionizer';

import {
  AddressData,
  ChangeData,
  RPCEvent,
  RPCMethod,
  WalletMethod,
  RemoteResponse,
  WalletStatus,
  Environment,
  CreateWalletParams,
  BackgroundEvent,
  CreateAddressParams,
} from './types';
import { isNil } from './utils';

let port;
let counter = 0;

export const remoteEvent = createEvent<RemoteResponse>();

remoteEvent.watch(({
  method = 'event', id, result, error,
}) => {
  console.info(`received ${method}:${id} with`, result, error);
});

export function getEnvironment(href = window.location.href) {
  const url = new URL(href);
  switch (url.pathname) {
    case '/popup.html':
      return Environment.POPUP;
    case '/page.html':
      return Environment.FULLSCREEN;
    case '/notification.html':
      return Environment.NOTIFICATION;
    default:
      return Environment.BACKGROUND;
  }
}

export function initRemoteWallet() {
  const name = getEnvironment();
  port = extensionizer.runtime.connect({ name });
  port.onMessage.addListener(remoteEvent);
}

export function handleWalletEvent<E>(
  event: RPCEvent | BackgroundEvent,
  handler: (payload: E) => void,
): Subscription {
  return remoteEvent.filterMap(({ id, result }) => (
    id === event ? result as E : undefined
  ))
    .watch(handler);
}

export function postMessage<T = any, P = unknown>(
  method: WalletMethod | RPCMethod,
  params?: P,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const target = counter;

    counter += 1;

    const unwatch = remoteEvent
      .filter({
        fn: ({ id }) => id === target,
      })
      .watch(({ result, error }) => {
        if (isNil(error)) {
          resolve(result);
        } else {
          reject(error);
        }

        unwatch();
      });

    console.info(`sending ${method}:${target} with`, params);
    port.postMessage({ id: target, method, params });
  });
}

export function convertTokenToJson(token: string) {
  return postMessage(WalletMethod.ConvertTokenToJson, token);
}

export function startWallet(pass: string) {
  return postMessage(WalletMethod.StartWallet, pass);
}

export function deleteWallet(pass: string) {
  return postMessage(WalletMethod.DeleteWallet, pass);
}

export function createWallet(params: CreateWalletParams) {
  return postMessage(WalletMethod.CreateWallet, params);
}

export function isAllowedWord(value: string) {
  return postMessage<boolean>(WalletMethod.IsAllowedWord, value);
}

export function isAllowedSeed(value: string[]) {
  return postMessage<boolean[]>(WalletMethod.IsAllowedSeed, value);
}

export function generateSeed() {
  return postMessage<string>(WalletMethod.GenerateSeed);
}

export function getWalletStatus() {
  return postMessage<WalletStatus>(RPCMethod.GetWalletStatus);
}

export function createAddress(params: CreateAddressParams) {
  return postMessage<string>(RPCMethod.CreateAddress, params);
}

export function getVersion() {
  return postMessage(RPCMethod.GetVersion);
}

export function loadBackgroundLogs() {
  return postMessage(WalletMethod.LoadBackgroundLogs);
}

export async function validateAddress(address: string): Promise<AddressData> {
  const result = await postMessage<AddressData>(RPCMethod.ValidateAddress, { address });
  const json = await postMessage(WalletMethod.ConvertTokenToJson, address);

  if (isNil(json)) {
    return result;
  }

  return {
    ...result,
    ...json,
  };
}

export function approveConnection(
  apiver: string,
  apivermin: string,
  appname: string,
  appurl: string,
) {
  return postMessage(WalletMethod.NotificationConnect, {
    result: true,
    apiver,
    apivermin,
    appname,
    appurl,
  });
}

export function approveContractInfoRequest(req) {
  return postMessage(WalletMethod.NotificationApproveInfo, { req });
}

export function rejectContractInfoRequest(req) {
  return postMessage(WalletMethod.NotificationRejectInfo, { req });
}

export interface CalculateChangeParams {
  amount: number;
  asset_id: number;
  is_push_transaction: boolean;
}

export function calculateChange(params: CalculateChangeParams) {
  return postMessage<ChangeData>(RPCMethod.CalculateChange, params);
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
  return postMessage(RPCMethod.SendTransaction, params);
}
