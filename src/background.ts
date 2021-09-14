/// <reference types="chrome"/>

import * as extensionizer from 'extensionizer';
import { sendWalletEvent } from '@core/api';
import { EnvironmentType } from '@core/types';
import WasmWallet from '@core/WasmWallet';

const wallet = WasmWallet.getInstance();
let isPortConnected = false;
let remotePortObj = null;

const connectRemote = (remotePort) => {
  isPortConnected = true;
  remotePortObj = remotePort;
  const processName = remotePort.name;
  console.log('remote connected', remotePort);

  remotePort.onDisconnect.addListener(() => {
    isPortConnected = false;
  })
  
  remotePort.onMessage.addListener(async (msg) => {
    if (msg.type !== undefined) {
      if (msg.type === 'start') {
        wallet.start(msg.pass);
      } else if (msg.type === 'create') {
        wallet.create(msg.seed, msg.pass, msg.isSeedConfirmed);
      }
    }

    if (msg.data !== undefined) {
      const {id, data} = msg;
      let sendResult = null;
      if (msg.data === 'get_seed') {
        sendResult = WasmWallet.getSeedPhrase();
      } else {
        sendResult = await wallet.send(data.method, data.params);
      }
      postMessage({id, result: sendResult});
    }
  });

  if (processName === EnvironmentType.POPUP) {
    if (!wallet.isRunning()) {
      initWallet();
    } else {
      reconnectHandler();
      wallet.subunsubTo(false);
      wallet.subunsubTo(true);
      postMessage({onboarding: false, isrunning: true});
    }
  }
};

const reconnectHandler = () => {
  wallet.updateHandler((event) => {
    postMessage({event});
  });
};

const initWallet = async () => {
  try {
    const result = await wallet.init((event) => {
      postMessage({event});
    });
    postMessage({onboarding: !result, isrunning: false});
  } catch (e){
    postMessage({onboarding: true, isrunning: false});
  }
}

const postMessage = (data) => {
  if (remotePortObj !== null && isPortConnected) {
    remotePortObj.postMessage(data);
  }
}

extensionizer.runtime.onConnect.addListener(connectRemote);

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
