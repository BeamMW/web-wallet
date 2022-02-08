/// <reference types="chrome"/>

import * as extensionizer from 'extensionizer';
import WasmWallet from '@core/WasmWallet';
import { Environment, RemoteRequest } from '@app/core/types';

import NotificationManager from '@core/NotificationManager';
import { ExternalAppMethod } from '@core/types';

window.global = globalThis;

const notificationManager = NotificationManager.getInstance();
const wallet = WasmWallet.getInstance();

let port = null;
let contentPort = null;
let connected = false;
let activeTab = null;

function postMessage(data) {
  if (port && connected) {
    port.postMessage(data);
  }
}

function handleConnect(remote) {
  port = remote;
  connected = true;
  // eslint-disable-next-line no-console
  console.log(`remote connected to "${port.name}"`);

  port.onDisconnect.addListener(() => {
    connected = false;
    if (activeTab && port.name === Environment.NOTIFICATION) {
      // notificationManager.closeTab(activeTab);
      activeTab = null;
      notificationManager.appname = ''; // TODO: check with reconnect
    }
  });

  port.onMessage.addListener(({ id, method, params }: RemoteRequest) => {
    if (method !== undefined) {
      wallet.send(id, method, params);
    }
  });

  switch (port.name) {
    case Environment.POPUP: {
      wallet.init(postMessage, null);
      break;
    }
    case Environment.NOTIFICATION: {
      const tabId = remote.sender.tab.id;
      notificationManager.openBeamTabsIDs[tabId] = true;
      activeTab = remote.sender.tab.id;
      wallet.init(postMessage, notificationManager.notification);
      break;
    }

    case Environment.CONTENT:
      NotificationManager.setPort(remote);
      break;

    case Environment.CONTENT_REQ: {
      notificationManager.setReqPort(remote);
      contentPort = remote;
      contentPort.onMessage.addListener((msg) => {
        if (wallet.isRunning()) {
          if (wallet.isConnectedSite({ appName: msg.appname, appUrl: remote.sender.url })) {
            msg.appurl = remote.sender.url;
            wallet.connectExternal(msg);
          } else if (msg.type === ExternalAppMethod.CreateBeamApi) {
            notificationManager.openConnectNotification(msg, remote.sender.url);
          } else if (msg.type === ExternalAppMethod.CreateBeamApiRetry) {
            /* eslint-disable-next-line @typescript-eslint/no-unused-expressions */
            notificationManager.appname === msg.appname
              ? notificationManager.openPopup()
              : notificationManager.openConnectNotification(msg, remote.sender.url);
          }
        } else {
          notificationManager.openAuthNotification(msg, remote.sender.url);
        }
      });

      contentPort.onDisconnect.addListener((e) => {
        wallet.disconnectAppApi(e.sender.url);
      });
      break;
    }
    default:
      break;
  }
}

wallet.initContractInfoHandler((req, info, amounts, cb) => {
  wallet.initcontractInfoHandlerCallback(cb);
  notificationManager.openContractNotification(req, info, amounts);
});

wallet.initSendHandler((req, info, cb) => {
  wallet.initSendHandlerCallback(cb);
  notificationManager.openSendNotification(req, info);
});

extensionizer.runtime.onConnect.addListener(handleConnect);
