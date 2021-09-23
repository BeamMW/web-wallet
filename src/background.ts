/// <reference types="chrome"/>

import * as extensionizer from 'extensionizer';
import { EnvironmentType } from '@core/types';

import { PortStream } from "@core/PortStream";
import { DnodeApp } from "@core/DnodeApp";
import NotificationManager from '@core/NotificationManager';
import { NotificationType } from '@core/types';

window.global = globalThis;

const notificationManager = new NotificationManager();

let uiIsTriggering = false;
let notificationIsOpen = false;
let contentPortObj = null;
const openBeamTabsIDs = {};

const approveContractInfoHandler = (req, info, amounts, cb) => {
    app.setNotificationInfo({type: NotificationType.APPROVE_INVOKE, params: {
      req, info, amounts,
    }}, cb);
    notificationIsOpen = true;
    openPopup();
}

const app = new DnodeApp(approveContractInfoHandler);

const connectRemote = (remotePort) => {
  const processName = remotePort.name;

  if (processName === EnvironmentType.CONTENT) {
    const portStream = new PortStream(remotePort);
    const origin = remotePort.sender.url
    app.connectPage(portStream, origin)

    contentPortObj = remotePort;
    contentPortObj.onMessage.addListener((msg) => {
      if (msg.data === 'create_beam_api') {
        app.setNotificationInfo({type: NotificationType.CONNECT, name: msg.name}, (res) => {
          contentPortObj.postMessage({result: res});
        });
        notificationIsOpen = true;
        openPopup();
      }
    });
  } else if (
      processName === EnvironmentType.POPUP || 
      processName === EnvironmentType.FULLSCREEN ||
      processName === EnvironmentType.NOTIFICATION) {
    console.log('popup connected', remotePort);

    const portStream = new PortStream(remotePort);
    app.connectPopup(portStream);

    remotePort.onDisconnect.addListener(() => {
      notificationIsOpen = false;
      console.log('popup disconnected');
    });
  }

  // if (processName === EnvironmentType.FULLSCREEN) {
  //   const tabId = remotePort.sender.tab.id;
  //   openBeamTabsIDs[tabId] = true;
  // }
};

extensionizer.runtime.onConnect.addListener(connectRemote);

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

async function triggerUi() {
  const tabs = await getActiveTabs();
  const currentlyActiveBeamTab = Boolean(
    tabs.find((tab) => openBeamTabsIDs[tab.id]),
  );
  if (
    !uiIsTriggering &&
    !currentlyActiveBeamTab
  ) {
    uiIsTriggering = true;
    try {
      await notificationManager.showPopup();
    } finally {
      uiIsTriggering = false;
    }
  }
}

const getActiveTabs = () => {
  return new Promise<any[]>((resolve, reject) => {
    extensionizer.tabs.query({ active: true }, (tabs) => {
      const error = checkForError();
      if (error) {
        return reject(error);
      }
      return resolve(tabs);
    });
  });
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
}
