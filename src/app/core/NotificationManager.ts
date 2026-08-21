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

  // A list, not a single slot: openPopup() can be awaited by the queue pump and by
  // the reconnect path at the same time, and both must be released on close.
  private popupResolvers: Array<() => void> = [];

  private static instance: NotificationManager;

  private uiIsTriggering = false;

  private openingPopup = false;

  private popupId = null;

  // Notifications awaiting their turn in the single `notification` slot.
  private notificationQueue: Array<{ notification: any; resolve: () => void }> = [];

  private activeNotification: { notification: any; resolve: () => void } | null = null;

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

  /**
   * Present notifications one at a time.
   *
   * `notification` is a single slot the popup reads to decide what to render, so
   * two concurrent approval requests used to mean the second silently replaced the
   * first and only one of them was ever shown. Queueing keeps every request
   * visible: each waits for the previous popup to close before taking the slot.
   */
  private enqueueNotification(notification: any): Promise<void> {
    return new Promise<void>((resolve) => {
      this.notificationQueue.push({ notification, resolve });
      this.pumpNotificationQueue();
    });
  }

  private pumpNotificationQueue() {
    if (this.activeNotification || this.notificationQueue.length === 0) return;

    const entry = this.notificationQueue.shift()!;
    this.activeNotification = entry;
    this.notification = entry.notification;
    if (entry.notification?.params?.appname) {
      this.appname = entry.notification.params.appname;
    }

    const finish = () => {
      this.activeNotification = null;
      this.notification = null;
      entry.resolve();
      this.pumpNotificationQueue();
    };

    this.openPopup().then(finish, (error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to present notification:', error);
      finish();
    });
  }

  openConnectNotification(msg, appurl) {
    this.appname = msg.appname;
    return this.enqueueNotification({
      type: NotificationType.CONNECT,
      params: {
        appurl,
        appname: msg.appname,
        apiver: msg.apiver,
        apivermin: msg.apivermin,
      },
    });
  }

  openAuthNotification(msg, appurl) {
    return this.enqueueNotification({
      type: NotificationType.AUTH,
      params: {
        appurl,
        appname: msg.appname,
        apiver: msg.apiver,
        apivermin: msg.apivermin,
        is_reconnect: msg.is_reconnect,
      },
    });
  }

  openSendNotification(req, info, appname?: string) {
    return this.enqueueNotification({
      type: NotificationType.APPROVE_TX,
      params: {
        req,
        info,
        appname: appname ?? req?.appname ?? this.appname,
      },
    });
  }

  openContractNotification(req, info, amounts, appname?: string) {
    // Assets are sourced by the notification UI from its own store (the engine
    // runs in the offscreen document and has no UI redux store).
    return this.enqueueNotification({
      type: NotificationType.APPROVE_INVOKE,
      params: {
        req,
        info,
        amounts,
        appname: appname ?? req?.appname ?? this.appname,
      },
    });
  }

  /** Called by api.ts when the notification popup closes (port disconnect). */
  closeNotification() {
    this.notificationIsOpen = false;
    if (!this.openingPopup) {
      this.notification = null;
      this.appname = '';
    }
    const resolvers = this.popupResolvers;
    this.popupResolvers = [];
    resolvers.forEach((resolve) => resolve());
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
      let settled = false;
      const settle = () => {
        if (settled) return;
        settled = true;
        resolve();
      };
      this.popupResolvers.push(settle);
      // 60-second hard ceiling in case the popup is force-closed without signalling.
      setTimeout(settle, 60_000);
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
