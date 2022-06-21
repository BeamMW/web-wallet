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
  CreateAddressParams,
  SendTransactionParams,
  TransactionDetail,
  ExternalAppConnection,
} from './types';

let port;
let counter = 0;

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
  if (port) return port;
  const name = getEnvironment();
  port = extensionizer.runtime.connect({ name });

  return port;
}

export function postMessage<T = any, P = unknown>(method: WalletMethod | RPCMethod | RPCEvent, params?: P): Promise<T> {
  return new Promise((resolve, reject) => {
    const target = counter;

    counter += 1;

    function handler(data: RemoteResponse) {
      if (data.id === target) {
        port.onMessage.removeListener(handler);
        if (data.error) {
          return reject(data.error);
        }
        return resolve(data.result);
      }
      return data;
    }

    port.onMessage.addListener(handler);

    // eslint-disable-next-line no-console
    // console.info(`sending ${method}:${target} with`, params);

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

export function stopWallet() {
  return postMessage(WalletMethod.StopWallet);
}

export function walletLocked() {
  return postMessage(WalletMethod.WalletLocked);
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

export function loadConnectedSites() {
  return postMessage(WalletMethod.LoadConnectedSites);
}

export function disconnectAllowedSite(params: ExternalAppConnection) {
  return postMessage(WalletMethod.DisconnectSite, params);
}

export async function validateAddress(address: string): Promise<AddressData> {
  const result = await postMessage<AddressData>(RPCMethod.ValidateAddress, { address });
  const json = await postMessage(WalletMethod.ConvertTokenToJson, address);

  if (!json) {
    return result;
  }

  return {
    ...result,
    ...json,
  };
}

export function finishNotificationAuth(apiver: string, apivermin: string, appname: string, appurl: string) {
  return postMessage(WalletMethod.NotificationAuthenticaticated, {
    result: true,
    apiver,
    apivermin,
    appname,
    appurl,
  });
}

export function approveConnection(apiver: string, apivermin: string, appname: string, appurl: string) {
  return postMessage(WalletMethod.NotificationConnect, {
    result: true,
    apiver,
    apivermin,
    appname,
    appurl,
  });
}

export function rejectConnection() {
  return postMessage(WalletMethod.NotificationConnect, {
    result: false,
  });
}

export function approveContractInfoRequest(req) {
  return postMessage(WalletMethod.NotificationApproveInfo, { req });
}

export function rejectContractInfoRequest(req) {
  return postMessage(WalletMethod.NotificationRejectInfo, { req });
}

export function approveSendRequest(req) {
  return postMessage(WalletMethod.NotificationApproveSend, { req });
}

export function rejectSendRequest(req) {
  return postMessage(WalletMethod.NotificationRejectSend, { req });
}

export interface CalculateChangeParams {
  amount: number;
  asset_id: number;
  is_push_transaction: boolean;
}

export function calculateChange(params: CalculateChangeParams) {
  return postMessage<ChangeData>(RPCMethod.CalculateChange, params);
}

export function sendTransaction(params: SendTransactionParams) {
  return postMessage(RPCMethod.SendTransaction, params);
}

export function getTransactionStatus(txId: string) {
  return postMessage<TransactionDetail>(RPCMethod.TxStatus, { txId, rates: true });
}

export function exportPaymentProof(txId: string) {
  return postMessage(RPCMethod.ExportPaymentProof, { txId });
}

export function verifyPaymentProof(payment_proof: string) {
  return postMessage(RPCMethod.VerifyPaymentProof, { payment_proof });
}
