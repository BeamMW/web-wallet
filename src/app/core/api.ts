import * as extensionizer from 'extensionizer';
import NotificationManager from '@core/NotificationManager';
import WasmWallet from '@core/WasmWallet';
import { Asset, ExternalAppMethod } from '@core/types';
import { RemoteRequest } from '@app/core/types';
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

const wallet = WasmWallet.getInstance();
const notificationManager = NotificationManager.getInstance();

let port;

let contentPort = null;
let notificationPort = null;
let connected = false;
let activeTab = null;

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

export function approveContractInfoRequest(req) {
  return wallet.notificationApproveInfo({ req });
}

export function rejectConnection() {
  return wallet.notificationAuthenticaticated({
    result: false,
  });
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

export function approveConnection({
  apiver, apivermin, appname, appurl,
}) {
  return wallet.approveConnection({
    result: true,
    apiver,
    apivermin,
    appname,
    appurl,
  });
}

function handleConnect(remote) {
  port = remote;
  connected = true;
  // eslint-disable-next-line no-console
  console.log(`remote connected to "${port.name}"`);

  port.onDisconnect.addListener(() => {
    connected = false;
    return connected;
  });

  port.onMessage.addListener(({ params, action }: RemoteRequest) => {
    if (action !== undefined) {
      switch (action) {
        case 'connect':
          approveConnection(params);
          break;
        case 'connect_rejected':
          rejectConnection();
          break;
        case 'rejectSendRequest':
          rejectSendRequest(params);
          break;
        case 'approveSendRequest':
          approveSendRequest(params);
          break;
        case 'rejectContractInfoRequest':
          rejectContractInfoRequest(params);
          break;
        case 'approveContractInfoRequest':
          approveContractInfoRequest(params);
          break;
        default:
          break;
      }
    }
  });

  switch (port.name) {
    case Environment.NOTIFICATION: {
      const tabId = remote.sender.tab.id;
      notificationManager.openBeamTabsIDs[tabId] = true;
      activeTab = remote.sender.tab.id;
      notificationPort = remote;
      notificationPort.onDisconnect.addListener(() => {
        if (activeTab) {
          // notificationManager.closeTab(activeTab);
          activeTab = null;
          notificationManager.appname = ''; // TODO: check with reconnect
          notificationManager.openBeamTabsIDs = {};
        }
      });
      notificationPort.postMessage({ isRunning: wallet.isRunning(), notification: notificationManager.notification });
      break;
    }

    case Environment.CONTENT:
      NotificationManager.setPort(remote);
      break;

    case Environment.CONTENT_REQ: {
      notificationManager.setReqPort(remote);
      contentPort = remote;
      contentPort.onMessage.addListener((msg) => {
        if (wallet.isRunning() && !localStorage.getItem('locked')) {
          if (wallet.isConnectedSite({ appName: msg.appname, appUrl: remote.sender.origin })) {
            msg.appurl = remote.sender.origin;
            wallet.connectExternal(msg);
          } else if (msg.type === ExternalAppMethod.CreateBeamApi) {
            if (msg.is_reconnect && notificationManager.appname === msg.appname) {
              // eslint-disable-next-line
              notificationManager.openPopup();
            } else {
              notificationManager.openConnectNotification(msg, remote.sender.origin);
            }
          }
        } else {
          notificationManager.openAuthNotification(msg, remote.sender.origin);
        }
      });

      contentPort.onDisconnect.addListener((e) => {
        wallet.disconnectAppApi(e.sender.origin);
      });
      break;
    }
    default:
      break;
  }
}

export function initRemoteConnection() {
  extensionizer.runtime.onConnect.addListener(handleConnect);

  wallet.initContractInfoHandler((req, info, amounts, cb) => {
    wallet.initcontractInfoHandlerCallback(cb);
    notificationManager.openContractNotification(req, info, amounts);
  });

  wallet.initSendHandler((req, info, cb) => {
    wallet.initSendHandlerCallback(cb);
    notificationManager.openSendNotification(req, info);
  });
}

export function postMessage<T = any, P = unknown>(method: RPCMethod, params?: P): Promise<T> {
  return new Promise((resolve, reject) => {
    const target = wallet.send(method, params);
    const handler = (data: RemoteResponse) => {
      if (data.id === target) {
        if (data.error) {
          return reject(data.error);
        }
        return resolve(data.result);
      }
      return data;
    };
    wallet.setRemoteEventHandler(handler);
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

export function getAssetInfo(asset_id: number) {
  return postMessage<Asset>(RPCMethod.GetAssetInfo, { asset_id });
}
