/// <reference types="chrome"/>

import * as extensionizer from 'extensionizer';
import WasmWallet from '@core/WasmWallet';
import { isNil } from '@app/core/utils';
import {
  Environment, RemoteRequest,
} from '@app/core/types';

import { PortStream } from '@core/PortStream';
import DnodeApp from '@core/DnodeApp';
import NotificationManager from '@core/NotificationManager';
import { NotificationType } from '@core/types';

window.global = globalThis;

const notificationManager = new NotificationManager();

const wallet = WasmWallet.getInstance();

let port = null;
let contentPort = null;
let connected = false;

let uiIsTriggering = false;
let notificationIsOpen = false;

const openBeamTabsIDs = {};

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

const app = new DnodeApp((req, info, amounts, cb) => {
  app.setNotificationInfo({
    type: NotificationType.APPROVE_INVOKE,
    params: {
      req, info, amounts,
    },
  }, cb);
  notificationIsOpen = true;
  openPopup();
});

function handleConnect(remote) {
  port = remote;
  connected = true;

  console.log(`remote connected to "${port.name}"`);

  port.onDisconnect.addListener(() => {
    connected = false;
  });

  port.onMessage.addListener(({ id, method, params }: RemoteRequest) => {
    wallet.send(id, method, params);
  });

  if (port.name === Environment.POPUP) {
    wallet.init(postMessage);
  }

  if (port.name === Environment.CONTENT) {
    const portStream = new PortStream(port);
    const origin = port.sender.url;
    app.connectPage(portStream, origin);

    contentPort = remote;
    contentPort.onMessage.addListener((msg) => {
      if (msg.data === 'create_beam_api') {
        app.setNotificationInfo({
          type: NotificationType.CONNECT, name: msg.name,
        }, (res) => {
          contentPort.postMessage({
            result: res,
          });
        });
        notificationIsOpen = true;
        openPopup();
      }
    });
  }

  // const connectRemote = (remotePort) => {
  //   const processName = remotePort.name;

  //   if (processName === EnvironmentType.CONTENT) {
  //     const portStream = new PortStream(remotePort);
  //     const origin = remotePort.sender.url
  //     app.connectPage(portStream, origin)

  //     contentPortObj = remotePort;
  //     contentPortObj.onMessage.addListener((msg) => {
  //       if (msg.data === 'create_beam_api') {
  //         app.setNotificationInfo({type: NotificationType.CONNECT, name: msg.name}, (res) => {
  //           contentPortObj.postMessage({result: res});
  //         });
  //         notificationIsOpen = true;
  //         openPopup();
  //       }
  //     });
  //   } else if (
  //       processName === EnvironmentType.POPUP ||
  //       processName === EnvironmentType.FULLSCREEN ||
  //       processName === EnvironmentType.NOTIFICATION) {
  //     console.log('popup connected', remotePort);

  //     const portStream = new PortStream(remotePort);
  //     app.connectPopup(portStream);

  //     remotePort.onDisconnect.addListener(() => {
  //       notificationIsOpen = false;
  //       console.log('popup disconnected');
  //     });
  //   }
  // };
}

extensionizer.runtime.onConnect.addListener(handleConnect);

// function openExtensionInBrowser() {
//   const extensionURL = chrome.runtime.getURL('popup.html');

//   chrome.tabs.create({ url: extensionURL });
// }

// chrome.runtime.onInstalled.addListener(({ reason }) => {
//   if (reason === 'install') {
//     // openExtensionInBrowser();
//   }
// });

// function getOwnTabs(): Promise<chrome.tabs.Tab[]> {
//   return Promise.all<chrome.tabs.Tab>(
//     chrome.extension
//       .getViews({ type: 'tab' })
//       .map(
//         (view) => new Promise(
//           (resolve) => view.chrome.tabs.getCurrent(
//             (tab) => resolve(Object.assign(tab, { url: view.location.href })),
//           ),
//         ),
//       ),
//   );
// }

// function openOptions(url) {
//   getOwnTabs().then((ownTabs) => {
//     const target = ownTabs.find((tab) => tab.url.includes(url));
//     if (target) {
//       if (target.active && target.status === 'complete') {
//         chrome.runtime.sendMessage({ text: 'stop-loading' });
//       } else {
//         chrome.tabs.update(target.id, { active: true });
//       }
//     }
//   });
// }

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.text === 'wallet-opened') {
//     openOptions('index.html');
//   }
// });
