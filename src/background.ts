/// <reference types="chrome"/>

import * as extensionizer from 'extensionizer';
import WasmWallet from '@core/WasmWallet';
import { isNil } from '@app/core/utils';
import {
  Environment, RemoteRequest,
} from '@app/core/types';

window.global = globalThis;

const wallet = WasmWallet.getInstance();

let port = null;
let connected = false;

function postMessage(data) {
  if (!isNil(port) && connected) {
    port.postMessage(data);
  }
}

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
