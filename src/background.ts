/// <reference types="chrome"/>

import * as extensionizer from 'extensionizer';
import WasmWallet from '@core/WasmWallet';
import { isNil } from '@app/core/utils';
import {
  Environment, RemoteRequest,
} from '@app/core/types';

import PortStream from '@core/PortStream';
import DnodeApp from '@core/DnodeApp';
import NotificationManager from '@core/NotificationManager';
import { NotificationType } from '@core/types';

window.global = globalThis;

const notificationManager = new NotificationManager();
const wallet = WasmWallet.getInstance();
const openBeamTabsIDs = {};

let port = null;
let contentPort = null;
let connected = false;

let uiIsTriggering = false;
let notification = null;
let notificationIsOpen = false;

function postMessage(data) {
  if (!isNil(port) && connected) {
    port.postMessage(data);
  }
}

const checkForError = () => {
  const { lastError } = extensionizer.runtime;
  if (!lastError) {
    return undefined;
  }
  if (lastError.stack && lastError.message) {
    return lastError;
  }
  return new Error(lastError.message);
};

const getActiveTabs = () => new Promise<any[]>((resolve, reject) => {
  extensionizer.tabs.query({ active: true }, (tabs) => {
    const error = checkForError();
    if (error) {
      return reject(error);
    }
    return resolve(tabs);
  });
});

async function triggerUi() {
  const tabs = await getActiveTabs();
  const currentlyActiveBeamTab = Boolean(
    tabs.find((tab) => openBeamTabsIDs[tab.id]),
  );
  if (
    !uiIsTriggering
    && !currentlyActiveBeamTab
  ) {
    uiIsTriggering = true;
    try {
      await notificationManager.showPopup();
    } finally {
      uiIsTriggering = false;
    }
  }
}

async function openPopup() {
  await triggerUi();
  await new Promise((resolve) => {
    const interval = setInterval(() => {
      if (!notificationIsOpen) {
        clearInterval(interval);
        resolve(true);
      }
    }, 1000);
  });
}

const app = new DnodeApp();

function handleConnect(remote) {
  port = remote;
  connected = true;

  console.log(`remote connected to "${port.name}"`);

  port.onDisconnect.addListener(() => {
    connected = false;
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
      wallet.init(postMessage, notification);
      break;
    }
    case Environment.CONTENT: {
      NotificationManager.setPort(remote);
      const portStream = new PortStream(remote);
      const origin = remote.sender.url;
      app.connectPage(portStream, origin);

      contentPort = remote;
      contentPort.onMessage.addListener((msg) => {
        if (msg.data === 'create_beam_api') {
          // TODO: check if api is supported
          // let supported = wasm.appSupported(msg.apiver, msg.minapiver)
          // 
          let supported = true
          if (supported) {
            notification = {
              type: NotificationType.CONNECT,
              params: {
                name: msg.appname,
                supported,
              },
            };
            notificationIsOpen = true;
            openPopup();
          } else {
            // TODO: ask permission, if allowed notify utils.js, show error in utils.js
            // "appname requires version msg.apiver of Beam Wallet or higher. Please update your wallet."
          }
        }
      });
      break;
    }
    default:
      break;
  }
}

wallet.initContractInfoHandler((req, info, amounts, cb) => {
  wallet.initcontractInfoHandlerCallback(cb);
  notification = {
    type: NotificationType.APPROVE_INVOKE,
    params: {
      req, info, amounts,
    },
  };
  notificationIsOpen = true;
  openPopup();
});

extensionizer.runtime.onConnect.addListener(handleConnect);

