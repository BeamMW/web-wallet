import * as extensionizer from 'extensionizer';
import { NotificationType } from '@core/types';
import ExtensionPlatform from './Extension';

const NOTIFICATION_HEIGHT = 600;
const NOTIFICATION_WIDTH = 900;

let contentPort;

export default class NotificationManager {
  platform = null;

  openBeamTabsIDs = {};

  notificationIsOpen = false;

  notification = null;

  appname = '';

  private static instance: NotificationManager;

  private uiIsTriggering = false;

  private popupId = null;

  private contentReqPort = null;

  static getInstance() {
    if (this.instance != null) {
      return this.instance;
    }
    this.instance = new NotificationManager();
    return this.instance;
  }

  static setPort(port) {
    contentPort = port;
  }

  static getPort() {
    return contentPort;
  }

  constructor() {
    this.platform = new ExtensionPlatform();
  }

  setReqPort(port) {
    this.contentReqPort = port;
  }

  postMessage(message) {
    this.contentReqPort.postMessage(message);
  }

  openConnectNotification(msg, appurl) {
    this.notification = {
      type: NotificationType.CONNECT,
      params: {
        appurl,
        appname: msg.appname,
        apiver: msg.apiver,
        apivermin: msg.apivermin,
      },
    };
    this.appname = msg.appname;
    this.notificationIsOpen = true;
    this.openPopup();
  }

  openAuthNotification(msg, appurl) {
    this.notification = {
      type: NotificationType.AUTH,
      params: {
        appurl,
        appname: msg.appname,
        apiver: msg.apiver,
        apivermin: msg.apivermin,
        is_reconnect: msg.is_reconnect,
      },
    };
    this.notificationIsOpen = true;
    this.openPopup();
  }

  openSendNotification(req, info) {
    this.notification = {
      type: NotificationType.APPROVE_TX,
      params: {
        req,
        info,
        appname: this.appname,
      },
    };
    this.notificationIsOpen = true;
    this.openPopup();
  }

  openContractNotification(req, info, amounts) {
    this.notification = {
      type: NotificationType.APPROVE_INVOKE,
      params: {
        req,
        info,
        amounts,
        appname: this.appname,
      },
    };
    this.notificationIsOpen = true;
    this.openPopup();
  }

  checkForError = () => {
    const { lastError } = extensionizer.runtime;
    if (!lastError) {
      return undefined;
    }
    if (lastError.stack && lastError.message) {
      return lastError;
    }
    return new Error(lastError.message);
  };

  getActiveTabs = () => new Promise<any[]>((resolve, reject) => {
    extensionizer.tabs.query({ active: true }, (tabs) => {
      const error = this.checkForError();
      if (error) {
        return reject(error);
      }
      return resolve(tabs);
    });
  });

  async triggerUi() {
    const tabs = await this.getActiveTabs();

    await Promise.all(
      tabs.map(async (item) => {
        if (this.openBeamTabsIDs[item.id] !== undefined) {
          await this.closeTab(item.id);
          delete this.openBeamTabsIDs[item.id];
        }
      }),
    );

    const currentlyActiveBeamTab = Boolean(tabs.find((tab) => this.openBeamTabsIDs[tab.id]));
    if (!this.uiIsTriggering && !currentlyActiveBeamTab) {
      this.uiIsTriggering = true;
      try {
        await this.showPopup();
      } finally {
        this.uiIsTriggering = false;
      }
    }
  }

  async openPopup() {
    await this.triggerUi();
    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!this.notificationIsOpen) {
          clearInterval(interval);
          resolve(true);
        }
      }, 1000);
    });
  }

  async showPopup() {
    const popup = await this.getPopup();

    if (popup) {
      await this.platform.focusWindow(popup.id);
    } else {
      const left = window.screen.width / 2 - NOTIFICATION_WIDTH / 2; // Calculate the horizontal position
      const top = window.screen.height / 2 - NOTIFICATION_HEIGHT / 2;

      const popupWindow = await this.platform.openWindow({
        url: 'notification.html',
        type: 'popup',
        width: NOTIFICATION_WIDTH,
        height: NOTIFICATION_HEIGHT,
        left,
        top,
      });

      if (popupWindow.left !== left && popupWindow.state !== 'fullscreen') {
        await this.platform.updateWindowPosition(popupWindow.id, left, top);
      }
      this.popupId = popupWindow.id;
    }
  }

  async closeTab(tabId) {
    return this.platform.closeTab(tabId);
  }

  private async getPopup() {
    const windows = await this.platform.getAllWindows();
    return this.getPopupIn(windows);
  }

  private getPopupIn(windows) {
    return windows ? windows.find((win) => win && win.type === 'popup' && win.id === this.popupId) : null;
  }
}
