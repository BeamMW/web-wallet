import {
  AddressData,
  ChangeData,
  RPCMethod,
  RemoteResponse,
  WalletStatus,
  Environment,
  CreateWalletParams,
  CreateAddressParams,
  SendTransactionParams,
  TransactionDetail,
  ExternalAppConnection,
} from './types';

import WasmWallet from '@core/WasmWallet';

const wallet = WasmWallet.getInstance();

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

export function postMessage<T = any, P = unknown>(method: RPCMethod, params?: P): Promise<T> {
  return new Promise((resolve, reject) => {
    const target = counter;

    counter += 1;

    function handler(data: RemoteResponse) {
      if (method === RPCMethod.GetWalletStatus) {
        console.log(data);
      }
      if (data.id === target) {
        if (data.error) {
          return reject(data.error);
        }
        return resolve(data.result);
      }
      return data;
    }

    wallet.setRemoteEventHandler(handler);

    wallet.send(target, method, params);
  });
}

export function convertTokenToJson(token: string) {
  return WasmWallet.convertTokenToJson(token);
}

export function startWallet(pass: string) {
  return wallet.start(pass);
}

export function deleteWallet(pass: string) {
  return wallet.deleteWallet(pass);
}

export function stopWallet() {
  return wallet.stop();
}

export function walletLocked() {
  return wallet.lockWallet();
}

export function createWallet(params: CreateWalletParams) {
  return wallet.create(params);
}

export function isAllowedWord(value: string) {
  return WasmWallet.isAllowedWord(value);
}

export function isAllowedSeed(value: string[]) {
  return WasmWallet.isAllowedSeed(value);
}

export function generateSeed() {
  return WasmWallet.generateSeed();
}

export function loadBackgroundLogs() {
  return WasmWallet.loadLogs();
}

export function loadConnectedSites() {
  return wallet.loadConnectedSites();
}

export function disconnectAllowedSite(params: ExternalAppConnection) {
  return wallet.removeConnectedSite(params);
}

export async function validateAddress(address: string): Promise<AddressData> {
  const result = await postMessage<AddressData>(RPCMethod.ValidateAddress, { address });
  const json = await convertTokenToJson(address);

  if (!json) {
    return result;
  }

  return {
    ...result,
    ...json,
  };
}

export function finishNotificationAuth(apiver: string, apivermin: string, appname: string, appurl: string) {
  return wallet.notificationAuthenticaticated({
    result: true,
    apiver,
    apivermin,
    appname,
    appurl,
  });
}

export function approveConnection(apiver: string, apivermin: string, appname: string, appurl: string) {
  return wallet.approveConnection({
    result: true,
    apiver,
    apivermin,
    appname,
    appurl,
  });
}

export function rejectConnection() {
  return wallet.notificationAuthenticaticated({
    result: false,
  });
}

export function approveContractInfoRequest(req) {
  return wallet.notificationApproveInfo({ req });
}

export function rejectContractInfoRequest(req) {
  return wallet.notificationRejectInfo({ req });
}

export function approveSendRequest(req) {
  return wallet.notificationApproveSend({ req });
}

export function rejectSendRequest(req) {
  return wallet.notificationRejectSend({ req });
}

export interface CalculateChangeParams {
  amount: number;
  asset_id: number;
  is_push_transaction: boolean;
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
