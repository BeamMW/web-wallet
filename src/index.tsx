import * as React from 'react';
import * as ReactDOM from 'react-dom';

import 'babel-polyfill';

import App from './app';

import { EnvironmentType } from '@core/types';
import * as extensionizer from 'extensionizer';
import WalletController from '@app/core/walletController';

window.global = window;

const walletController = WalletController.getInstance();

const getEnvironmentType = (url = window.location.href) => {
    const parsedUrl = new URL(url);
    if (parsedUrl.pathname === '/popup.html') {
      return EnvironmentType.POPUP;
    } else if (parsedUrl.pathname === '/page.html') {
      return EnvironmentType.FULLSCREEN;
    } else if (parsedUrl.pathname === '/notification.html') {
      return EnvironmentType.NOTIFICATION;
    }
    return EnvironmentType.BACKGROUND;
};

start();

async function start() {
    const windowType = getEnvironmentType();
    const activeTab = await queryCurrentActiveTab(windowType);
    const extensionPort = extensionizer.runtime.connect({ name: windowType });

    walletController.initBgProvider(extensionPort, initializeUiWithTab, activeTab); 

    function initializeUiWithTab(state, tab) {
        initializeUi(state);
    }
}

async function queryCurrentActiveTab(windowType) {
    return new Promise((resolve) => {
      if (windowType !== EnvironmentType.POPUP) {
        resolve({});
        return;
      }
  
      extensionizer.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const [activeTab] = tabs;
        const { id, title, url } = activeTab;
        const { origin, protocol } = url ? new URL(url) : {origin:null, protocol:null};
  
        if (!origin || origin === 'null') {
          resolve({});
          return;
        }
  
        resolve({ id, title, origin, protocol, url });
      });
    });
}

function initializeUi(state) {
  ReactDOM.render(<App params={state} />, document.getElementById('root'));
}
