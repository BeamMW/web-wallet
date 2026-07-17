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

  private popupResolve: (() => void) | null = null;

  private static instance: NotificationManager;

  private uiIsTriggering = false;

  private openingPopup = false;

  private popupId = null;

  // notification.html → page.html channel (NOTIFICATION port, set by shared saga).
  private reqPort: chrome.runtime.Port | null = null;

  // page.html → content script auth responses; keyed by origin to avoid multi-tab misrouting.
  private contentReqPorts = new Map<string, chrome.runtime.Port>();

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

  // Called by shared saga in notification.html context to wire up the NOTIFICATION port.
  setReqPort(port: chrome.runtime.Port) {
    this.reqPort = port;
  }

  // Send an action message from notification.html → page.html via the NOTIFICATION port.
  postMessage(message: any) {
    this.reqPort?.postMessage(message);
  }

  // Called by api.ts in page.html context to register each dApp's CONTENT_REQ port.
  setContentReqPort(port: chrome.runtime.Port, origin: string) {
    this.contentReqPorts.set(origin, port);
    port.onDisconnect.addListener(() => {
      if (this.contentReqPorts.get(origin) === port) {
        this.contentReqPorts.delete(origin);
      }
    });
  }

  // Send an auth response from page.html → content script for the given origin.
  sendAuthResponse(message: any, origin: string) {
    this.contentReqPorts.get(origin)?.postMessage(message);
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
    this.openPopup();
  }

  openSendNotification(req, info, appname?: string) {
    this.notification = {
      type: NotificationType.APPROVE_TX,
      params: {
        req,
        info,
        appname: appname ?? req?.appname ?? this.appname,
      },
    };
    this.openPopup();
  }

  openContractNotification(req, info, amounts, appname?: string) {
    // Assets are sourced by the notification UI from its own store (the engine
    // runs in the offscreen document and has no UI redux store).
    this.notification = {
      type: NotificationType.APPROVE_INVOKE,
      params: {
        req,
        info,
        amounts,
        appname: appname ?? req?.appname ?? this.appname,
      },
    };
    this.openPopup();
  }

  /** Called by api.ts when the notification popup closes (port disconnect). */
  closeNotification() {
    this.notificationIsOpen = false;
    if (!this.openingPopup) {
      this.notification = null;
      this.appname = '';
    }
    this.popupResolve?.();
    this.popupResolve = null;
  }

  // Delegate a window/tab operation to the service worker. The engine runs in an
  // offscreen document, which has no access to chrome.windows / chrome.tabs.
  // eslint-disable-next-line class-methods-use-this
  private sw<T = any>(op: string, payload?: any): Promise<T> {
    return new Promise((resolve, reject) => {
      extensionizer.runtime.sendMessage({ target: 'sw-winop', op, payload }, (res) => {
        const { lastError } = extensionizer.runtime;
        if (lastError) {
          reject(new Error(lastError.message));
          return;
        }
        if (res && res.error) {
          reject(new Error(res.error));
          return;
        }
        resolve(res ? res.result : undefined);
      });
    });
  }

  getActiveTabs = () => this.sw<any[]>('getActiveTabs');

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
    this.notificationIsOpen = true;
    this.openingPopup = true;
    try {
      await this.triggerUi();
    } finally {
      this.openingPopup = false;
    }
    await new Promise<void>((resolve) => {
      this.popupResolve = resolve;
      // 60-second hard ceiling in case the popup is force-closed without signalling.
      setTimeout(() => {
        this.popupResolve = null;
        resolve();
      }, 60_000);
    });
    this.notificationIsOpen = false;
  }

  async showPopup() {
    const popup = await this.getPopup();

    if (popup) {
      await this.sw('focusWindow', { windowId: popup.id });
      return;
    }

    // Center on the last focused window (offscreen has no reliable window.screen).
    const focused = await this.sw<any>('getLastFocused').catch(() => null);
    const baseLeft = focused?.left ?? 0;
    const baseTop = focused?.top ?? 0;
    const baseWidth = focused?.width ?? 1280;
    const baseHeight = focused?.height ?? 800;
    const left = Math.round(baseLeft + baseWidth / 2 - NOTIFICATION_WIDTH / 2);
    const top = Math.round(baseTop + baseHeight / 2 - NOTIFICATION_HEIGHT / 2);

    const popupWindow = await this.sw<any>('openWindow', {
      url: 'notification.html',
      type: 'popup',
      width: NOTIFICATION_WIDTH,
      height: NOTIFICATION_HEIGHT,
      left,
      top,
    });

    this.popupId = popupWindow?.id ?? null;
  }

  async closeTab(tabId) {
    return this.sw('closeTab', { tabId });
  }

  private async getPopup() {
    const windows = await this.sw<any[]>('getAllWindows');
    return this.getPopupIn(windows);
  }

  private getPopupIn(windows) {
    return windows ? windows.find((win) => win && win.type === 'popup' && win.id === this.popupId) : null;
  }
}
