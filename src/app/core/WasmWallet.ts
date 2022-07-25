import * as extensionizer from 'extensionizer';
import * as passworder from 'browser-passworder';

import PortStream from '@core/PortStream';

import { GROTHS_IN_BEAM } from '@app/containers/Wallet/constants';
import config from '@app/config';

import { SyncStep } from '@app/containers/Auth/interfaces';
import { ExternalAppConnection, NotificationType } from '@core/types';
import { BackgroundEvent, CreateWalletParams, Notification, RPCEvent, RPCMethod, WalletMethod } from './types';
import NotificationManager from './NotificationManager';
import DnodeApp from './DnodeApp';
import { approveConnection } from '@core/api';

declare const BeamModule: any;

const PATH_DB = '/beam_wallet/wallet.db';

const notificationManager = NotificationManager.getInstance();

let WasmWalletClient;
let MyModule;
export interface WalletEvent<T = any> {
  id: number | RPCEvent | BackgroundEvent;
  result: T;
  error?: any;
}

export enum ErrorMessage {
  INVALID = 'Invalid password provided',
  EMPTY = 'Please, enter password',
}

type WalletEventHandler = {
  (event: WalletEvent): void;
};

const bgLogs = {
  common: [],
  // eslint-disable-next-line no-console
  commonDef: console.log.bind(console),
  errors: [],
  // eslint-disable-next-line no-console
  errorsDef: console.error.bind(console),
  warns: [],
  // eslint-disable-next-line no-console
  warnsDef: console.warn.bind(console),
};

// eslint-disable-next-line no-console
console.log = function (...args) {
  bgLogs.commonDef.apply(console, args);
  bgLogs.common.push(Array.from(args));
};
// eslint-disable-next-line no-console
console.error = function (...args) {
  bgLogs.errorsDef.apply(console, args);
  bgLogs.errors.push(Array.from(args));
};
// eslint-disable-next-line no-console
console.warn = function (...args) {
  bgLogs.warnsDef.apply(console, args);
  bgLogs.warns.push(Array.from(args));
};

export default class WasmWallet {
  private static instance: WasmWallet;

  private passwordHash: string;

  private contractInfoHandler;

  private contractInfoHandlerCallback;

  private sendHandler;

  private sendHandlerCallback;

  // TODO:BRO map [url->app]
  private apps = {};

  private connectedApps = [];

  static getInstance() {
    if (this.instance != null) {
      return this.instance;
    }
    this.instance = new WasmWallet();
    return this.instance;
  }

  static async mount(): Promise<boolean> {
    const module = await BeamModule();
    MyModule = module;
    WasmWalletClient = module.WasmWalletClient;

    return new Promise((resolve) => {
      WasmWalletClient.MountFS(resolve);
    });
  }

  static initSettings(seedConfirmed: boolean) {
    extensionizer.storage.local.set({
      settings: {
        privacySetting: false,
        saveLogsSetting: 0,
        currencySetting: {
          value: 0,
          updated: new Date().getTime(),
        },
        dnsSetting: 'wallet-service.beam.mw',
        ipSetting: '3.222.86.179:20000',
        verificatedSetting: {
          state: seedConfirmed,
          isMessageClosed: false,
          balanceWasPositive: false,
          balanceWasPositiveMoreEn: false,
        },
        passwordCheck: true,
      },
    });
  }

  static initConnectedSites() {
    extensionizer.storage.local.set({
      sites: [],
    });
  }

  static async saveWallet(pass: string) {
    const data = await passworder.encrypt(pass, Date.now());
    extensionizer.storage.local.remove(['wallet']);
    extensionizer.storage.local.set({ wallet: data });
    return data;
  }

  static removeWallet() {
    WasmWalletClient.DeleteWallet(PATH_DB);
    extensionizer.storage.local.remove(['wallet']);
  }

  static checkPassword(pass: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (pass === '') {
        reject(ErrorMessage.EMPTY);
      }

      extensionizer.storage.local.get('wallet', ({ wallet }) => {
        passworder
          .decrypt(pass, wallet)
          .then(() => {
            resolve(pass);
          })
          .catch(() => {
            reject(ErrorMessage.INVALID);
          });
      });
    });
  }

  static loadLogs() {
    return bgLogs;
  }

  static isAllowedWord(word: string): boolean {
    return WasmWalletClient.IsAllowedWord(word);
  }

  static isAppSupported(apiver: string, apivermin: string): boolean {
    return WasmWalletClient.IsAppSupported(apiver, apivermin);
  }

  static generateAppID(appurl: string, appname: string): string {
    return WasmWalletClient.GenerateAppID(appurl, appname);
  }

  static isAllowedSeed(seed: string[]) {
    return seed.map(WasmWallet.isAllowedWord);
  }

  static isInitialized(): boolean {
    return WasmWalletClient.IsInitialized(PATH_DB);
  }

  static convertTokenToJson(token: string) {
    try {
      const json = WasmWalletClient.ConvertTokenToJson(token);
      const result = JSON.parse(json);

      const { Amount: amount, AssetID: id } = result.params;

      return {
        amount: !amount ? null : parseFloat(amount) / GROTHS_IN_BEAM,
        asset_id: !id ? null : parseInt(id, 10),
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      return null;
    }
  }

  static generateSeed() {
    return WasmWalletClient.GeneratePhrase();
  }

  private wallet: typeof WasmWalletClient;

  private mounted: boolean = false;

  private eventHandler: WalletEventHandler;
  private remoteEventHandler: WalletEventHandler;

  setRemoteEventHandler(handler: WalletEventHandler) {
    if (!this.remoteEventHandler) {
      this.remoteEventHandler = handler;
    }
  }

  async init(handler: WalletEventHandler, notification: Notification) {
    this.eventHandler = handler;

    if (this.isRunning()) {
      this.emit(BackgroundEvent.CONNECTED, {
        onboarding: false,
        is_running: true,
        notification,
      });

      this.toggleEvents(false);
      this.toggleEvents(true);
      return;
    }

    try {
      if (!this.mounted) {
        await WasmWallet.mount();

        this.mounted = true;
      }

      this.emit(BackgroundEvent.CONNECTED, {
        is_running: false,
        onboarding: !WasmWalletClient.IsInitialized(PATH_DB),
        notification,
      });
    } catch {
      this.emit(BackgroundEvent.CONNECTED, {
        is_running: false,
        onboarding: true,
        notification: null,
      });
    }
  }

  initContractInfoHandler(handler) {
    this.contractInfoHandler = handler;
  }

  initcontractInfoHandlerCallback(cb) {
    this.contractInfoHandlerCallback = cb;
  }

  initSendHandler(handler) {
    this.sendHandler = handler;
  }

  initSendHandlerCallback(cb) {
    this.sendHandlerCallback = cb;
  }

  emit(id: number | RPCEvent | BackgroundEvent, result?: any, error?: any) {
    // eslint-disable-next-line no-console
    console.info(`emitted event "${id}" with`, result);
    this.eventHandler({
      id,
      result,
      error,
    });
  }

  async start(pass: string) {
    if (this.isRunning()) {
      this.emit(BackgroundEvent.UNLOCK_WALLET, true);
      if (notificationManager.notification && notificationManager.notification.type === NotificationType.AUTH) {
        if (
          this.isConnectedSite({
            appName: notificationManager.notification.params.appname,
            appUrl: notificationManager.notification.params.appurl,
          })
        ) {
          if (!notificationManager.notification.params.is_reconnect) {
            this.connectExternal(notificationManager.notification.params);
          } else {
            Object.values(this.apps).forEach((url: string) => {
              this.apps[url].walletUnlocked();
            });
          }
          this.emit(BackgroundEvent.CLOSE_NOTIFICATION);
        } else {
          const notification = {
            type: 'connect',
            params: notificationManager.notification.params,
          };
          this.emit(BackgroundEvent.CONNECTED, {
            onboarding: false,
            is_running: true,
            notification,
          });
        }
      } else {
        this.emit(BackgroundEvent.CONNECTED, {
          onboarding: false,
          is_running: true,
          notification: null,
        });
      }
      return;
    }
    this.emit(BackgroundEvent.UNLOCK_WALLET, false);

    if (!this.wallet) {
      this.wallet = new WasmWalletClient(PATH_DB, pass, config.path_node);
    }

    const responseHandler = (response) => {
      const event = JSON.parse(response);
      // eslint-disable-next-line no-console
      console.info(event);
      this.eventHandler(event);
      this?.remoteEventHandler(event);
    };

    this.wallet.startWallet();
    this.wallet.subscribe(responseHandler);
    this.wallet.setApproveContractInfoHandler(this.contractInfoHandler);
    this.wallet.setApproveSendHandler(this.sendHandler);
    await this.loadConnectedApps();

    this.toggleEvents(true);
  }

  // TODO: will be updated after sub response fix in wallet api
  toggleEvents(value: boolean) {
    this.send(0, RPCMethod.SubUnsub, {
      ev_addrs_changed: value,
      ev_assets_changed: value,
      ev_sync_progress: value,
      ev_system_state: value,
      ev_txs_changed: value,
      ev_utxos_changed: value,
    });
  }

  isRunning(): boolean {
    return !this.wallet ? false : this.wallet.isRunning();
  }

  async createAppAPI(apiver: string, apivermin: string, appurl: string, appname: string, handler: any) {
    return new Promise((resolve, reject) => {
      const appid = WasmWallet.generateAppID(appname, appurl);
      // eslint-disable-next-line no-console
      console.log(`createAppAPI for ${appname}, ${appid}`);
      // eslint-disable-next-line consistent-return
      this.wallet.createAppAPI(apiver, apivermin, appid, appname, (err, api) => {
        if (err) {
          return reject(err);
        }
        api.setHandler(handler);
        resolve(api);
      });
    });
  }

  private loadConnectedApps() {
    return new Promise((resolve) => {
      extensionizer.storage.local.get('sites', ({ sites }) => {
        this.connectedApps = sites || [];
        resolve(true);
      });
    });
  }

  isConnectedSite(site: ExternalAppConnection): boolean {
    const isConnected = !!this.connectedApps.find((item) => item.appUrl === site.appUrl);
    return isConnected;
  }

  removeConnectedSite(site: ExternalAppConnection) {
    this.connectedApps.splice(
      this.connectedApps.findIndex((el) => el.appUrl === site.appUrl && el.appName === site.appName),
      1,
    );

    extensionizer.storage.local.set({
      sites: this.connectedApps,
    });

    return this.connectedApps;
  }

  addConnectedSite(site: ExternalAppConnection) {
    const isExist = this.connectedApps.find((item: ExternalAppConnection) => item.appUrl === site.appUrl);
    if (!isExist) {
      this.connectedApps.push(site);
      extensionizer.storage.local.set({
        sites: this.connectedApps,
      });
    }
  }

  disconnectAppApi(url) {
    if (this.apps[url]) {
      this.apps[url].appApi.delete();
      delete this.apps[url].appApi;
      delete this.apps[url].appApiHandler;
      delete this.apps[url];
    }
  }

  setApproveSendHandler(handler) {
    this.wallet.setApproveSendHandler(handler);
  }

  setApproveContractInfoHandler(handler) {
    this.wallet.setApproveContractInfoHandler(handler);
  }

  async fastSync() {
    const response = await fetch(config.restore_url);
    const reader = response.body.getReader();

    const contentLength = +response.headers.get('Content-Length');

    this.emit(BackgroundEvent.CHANGE_SYNC_STEP, SyncStep.DOWNLOAD);

    let receivedLength = 0;
    let download_percent = 0;
    let restore_percent = 0;
    const chunks = [];
    while (true) {
      /* eslint-disable no-await-in-loop */
      const { done, value } = await reader.read();
      /* eslint-enable no-await-in-loop */
      if (value) {
        chunks.push(value);
        receivedLength += value.length;
        const percent = Number(Math.floor(100 / (contentLength / receivedLength)).toFixed());
        if (percent > download_percent) {
          download_percent = percent;
          this.emit(BackgroundEvent.DOWNLOAD_DB_PROGRESS, {
            done: receivedLength,
            total: contentLength,
          });
        }
      }
      if (done) {
        break;
      }
    }
    const blob = new Blob(chunks);
    const data = await blob.arrayBuffer();
    const payload = new Uint8Array(data);

    const recoveryFileName = 'recovery.bin';
    MyModule.FS.writeFile(recoveryFileName, payload);
    this.emit(BackgroundEvent.CHANGE_SYNC_STEP, SyncStep.RESTORE);

    this.wallet.importRecoveryFromFile(recoveryFileName, (error, done, total) => {
      if (done === total) {
        this.emit(BackgroundEvent.CHANGE_SYNC_STEP, SyncStep.SYNC);
      }
      if (error == null) {
        const percent = Number(Math.floor(100 / (total / done)).toFixed());
        if (percent > restore_percent) {
          restore_percent = percent;
          this.emit(BackgroundEvent.RESTORE_DB_PROGRESS, {
            done,
            total,
          });
        }
      } else {
        console.log(`Failed to recover: ${error}`);
      }
    });

    return null;
  }

  async create({ seed, password, isSeedConfirmed }: CreateWalletParams) {
    try {
      if (WasmWallet.isInitialized()) {
        WasmWallet.removeWallet();
      }

      WasmWallet.saveWallet(password);
      WasmWallet.initSettings(isSeedConfirmed);
      WasmWallet.initConnectedSites();

      WasmWalletClient.CreateWallet(seed, PATH_DB, password);
      if (!this.wallet) {
        this.wallet = new WasmWalletClient(PATH_DB, password, config.path_node);
      }
      await this.fastSync();

      this.start(password);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  stop() {
    return new Promise((resolve, reject) => {
      if (!this.wallet) {
        resolve(true);
        return;
      }

      this.wallet.stopWallet((data) => {
        const running = this.wallet.isRunning();
        // eslint-disable-next-line no-console
        console.log(`is running: ${this.wallet.isRunning()}`);
        // eslint-disable-next-line no-console
        console.log('wallet stopped:', data);

        if (running) {
          // eslint-disable-next-line
          reject(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  async connectExternal(params) {
    if (!WasmWallet.isAppSupported(params.apiver, params.apivermin)) {
      return notificationManager.postMessage({
        result: false,
        errcode: -1,
        ermsg: 'Unsupported API version required',
      });
      // TODO:BRO handle error in Utils.js
    }
    try {
      this.apps[params.appurl] = new DnodeApp();
      await this.apps[params.appurl].createAppAPI(
        WasmWallet.getInstance(),
        params.apiver,
        params.apivermin,
        params.appname,
        params.appurl,
      );
      const port = NotificationManager.getPort();

      const portStream = new PortStream(port);
      this.apps[params.appurl].connectPage(portStream, params.appurl);
      return notificationManager.postMessage({
        result: true,
      });
    } catch (err) {
      // TODO:BRO handle error in Utils.js
      return notificationManager.postMessage({
        result: false,
        errcode: -2,
        ermsg: err,
      });
    }
  }

  async deleteWallet(pass: string) {
    await WasmWallet.checkPassword(pass);
    await this.stop();
    return WasmWallet.removeWallet();
  }

  lockWallet() {
    Object.values(this.apps).forEach((url: string) => {
      this.apps[url].walletIsLocked();
    });
  }

  loadConnectedSites() {
    return this.connectedApps;
  }

  notificationAuthenticaticated(params: any) {
    if (params.result) {
      if (this.isConnectedSite({ appName: params.appname, appUrl: params.appurl })) {
        this.connectExternal(params);
        this.emit(BackgroundEvent.CLOSE_NOTIFICATION);
      } else {
        const notification = {
          type: 'connect',
          params,
        };
        this.emit(BackgroundEvent.CONNECTED, {
          onboarding: false,
          is_running: true,
          notification,
        });
      }
    }
  }

  approveConnection(params: any) {
    if (params.result) {
      this.addConnectedSite({ appName: params.appname, appUrl: params.appurl });
      this.connectExternal(params);
    } else {
      return notificationManager.postMessage({
        result: false,
        errcode: -3,
        ermsg: 'Connection rejected',
      });
    }
  }

  notificationApproveInfo(params: any) {
    if (params.req) {
      this.contractInfoHandlerCallback.contractInfoApproved(params.req);
    }
  }

  notificationRejectInfo(params: any) {
    if (params.req) {
      this.contractInfoHandlerCallback.contractInfoApproved(params.req);
    }
  }

  notificationApproveSend(params: any) {
    if (params.req) {
      this.sendHandlerCallback.sendApproved(params.req);
    }
  }
  notificationRejectSend(params: any) {
    if (params.req) {
      this.sendHandlerCallback.sendApproved(params.req);
    }
  }

  async callInternal(id: number, method: WalletMethod, params: any) {
    switch (method) {
      case WalletMethod.ConvertTokenToJson: {
        const result = WasmWallet.convertTokenToJson(params);
        this.emit(id, result);
        break;
      }
      case WalletMethod.GenerateSeed: {
        const result = WasmWallet.generateSeed();
        this.emit(id, result);
        break;
      }
      case WalletMethod.IsAllowedWord: {
        const result = params === '' ? null : WasmWallet.isAllowedWord(params);
        this.emit(id, result);
        break;
      }
      case WalletMethod.IsAllowedSeed: {
        const result = WasmWallet.isAllowedSeed(params);
        this.emit(id, result);
        break;
      }
      case WalletMethod.CreateWallet:
        this.create(params);
        break;
      case WalletMethod.StartWallet:
        try {
          await WasmWallet.checkPassword(params);
          this.start(params);
          // this.emit(id);
        } catch (error) {
          // this.emit(id, null, error);
        }
        break;
      case WalletMethod.StopWallet:
        await this.stop();
        break;
      case WalletMethod.DeleteWallet:
        try {
          await WasmWallet.checkPassword(params);
          await this.stop();
          WasmWallet.removeWallet();
          this.emit(id);
        } catch (error) {
          this.emit(id, null, error);
        }
        break;
      case WalletMethod.NotificationAuthenticaticated:
        if (params.result) {
          if (this.isConnectedSite({ appName: params.appname, appUrl: params.appurl })) {
            this.connectExternal(params);
            this.emit(BackgroundEvent.CLOSE_NOTIFICATION);
          } else {
            const notification = {
              type: 'connect',
              params,
            };
            this.emit(BackgroundEvent.CONNECTED, {
              onboarding: false,
              is_running: true,
              notification,
            });
            // notificationManager.openConnectNotification(params, params.appurl)
          }
        }
        break;
      case WalletMethod.NotificationConnect:
        // eslint-disable-next-line no-case-declarations
        if (params.result) {
          this.addConnectedSite({ appName: params.appname, appUrl: params.appurl });
          this.connectExternal(params);
        } else {
          return notificationManager.postMessage({
            result: false,
            errcode: -3,
            ermsg: 'Connection rejected',
          });
        }
        break;
      case WalletMethod.LoadConnectedSites:
        this.emit(id, this.connectedApps);
        break;
      case WalletMethod.DisconnectSite:
        this.removeConnectedSite(params);
        this.emit(id, true);
        break;
      case WalletMethod.NotificationApproveInfo:
        if (params.req) {
          this.contractInfoHandlerCallback.contractInfoApproved(params.req);
        }
        break;
      case WalletMethod.NotificationRejectInfo:
        if (params.req) {
          this.contractInfoHandlerCallback.contractInfoRejected(params.req);
        }
        break;
      case WalletMethod.NotificationApproveSend:
        if (params.req) {
          this.sendHandlerCallback.sendApproved(params.req);
        }
        break;
      case WalletMethod.NotificationRejectSend:
        if (params.req) {
          this.sendHandlerCallback.sendRejected(params.req);
        }
        break;
      case WalletMethod.LoadBackgroundLogs:
        this.emit(id, WasmWallet.loadLogs());
        break;
      case WalletMethod.WalletLocked:
        Object.values(this.apps).forEach((url: string) => {
          this.apps[url].walletIsLocked();
        });

        break;
      default:
        break;
    }

    return null;
  }

  send(id: number, method: RPCMethod | WalletMethod, params?: any) {
    const internal = Object.values(WalletMethod).includes(method as WalletMethod);

    if (internal) {
      try {
        this.callInternal(id, method as WalletMethod, params);
      } catch (error) {
        this.emit(id, null, error);
      }
      return;
    }

    this.wallet.sendRequest(
      JSON.stringify({
        jsonrpc: '2.0',
        id,
        method,
        params,
      }),
    );
  }
}
