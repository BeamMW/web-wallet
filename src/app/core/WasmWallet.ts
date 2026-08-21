import * as passworder from 'browser-passworder';

import { storageLocal } from '@core/storage';

import { GROTHS_IN_BEAM } from '@app/containers/Wallet/constants';
import config from '@app/config';

import { SyncStep } from '@app/containers/Auth/interfaces';
import { ExternalAppConnection, NotificationType } from '@core/types';
import { getWalletLocked, isWalletLockedSync, setWalletLocked } from '@core/lockState';

import {
  BackgroundEvent,
  ConnectedData,
  CreateWalletParams,
  Notification,
  RPCEvent,
  RPCMethod,
  SyncStateSnapshot,
  WalletMethod,
} from './types';
import NotificationManager from './NotificationManager';

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

const MAX_BG_LOG_ENTRIES = 1000;
const pushCapped = (arr: unknown[], entry: unknown) => {
  arr.push(entry);
  if (arr.length > MAX_BG_LOG_ENTRIES) {
    arr.shift();
  }
};

// eslint-disable-next-line no-console
console.log = function (...args) {
  bgLogs.commonDef.apply(console, args);
  pushCapped(bgLogs.common, Array.from(args));
};
// eslint-disable-next-line no-console
console.error = function (...args) {
  bgLogs.errorsDef.apply(console, args);
  pushCapped(bgLogs.errors, Array.from(args));
};
// eslint-disable-next-line no-console
console.warn = function (...args) {
  bgLogs.warnsDef.apply(console, args);
  pushCapped(bgLogs.warns, Array.from(args));
};

export default class WasmWallet {
  private static instance: WasmWallet;

  private counter = 0;

  private contractInfoHandler;

  private sendHandler;

  // Approval callbacks are keyed by the WASM request id. A single slot would be
  // overwritten whenever two dApps (or two tabs) request approval concurrently,
  // stranding the first request's callback forever.
  private contractInfoCallbacks = new Map<string, any>();

  private sendCallbacks = new Map<string, any>();

  private apps: Record<string, { appApi: any; appname: string; appurl: string }> = {};

  private externalAppMessageHandler: ((appurl: string, json: string) => void) | null = null;

  private connectedApps = [];

  // Sync state lives here, not in the UI store: the popup is torn down on every
  // close while the engine keeps syncing, so this is the only durable copy.
  private syncState: SyncStateSnapshot = {
    step: SyncStep.SYNC,
    is_synced: false,
    sync_progress: null,
    download_progress: null,
    restore_progress: null,
  };

  static getInstance() {
    if (this.instance != null) {
      return this.instance;
    }
    this.instance = new WasmWallet();
    return this.instance;
  }

  setExternalAppMessageHandler(handler: (appurl: string, json: string) => void) {
    this.externalAppMessageHandler = handler;
  }

  private emitToExternalApp(appurl: string, payload: any) {
    if (!this.externalAppMessageHandler) return;
    const json = typeof payload === 'string' ? payload : JSON.stringify(payload);
    this.externalAppMessageHandler(appurl, json);
  }

  async callExternalWalletApi(appurl: string, req: { id: string; method: string; params?: any }) {
    const app = this.apps[appurl];
    if (!app || !app.appApi) return false;

    if (await getWalletLocked()) {
      this.emitToExternalApp(appurl, {
        jsonrpc: '2.0',
        id: req.id,
        error: { code: -5, message: 'Wallet is locked' },
      });
      return true;
    }

    const request = {
      jsonrpc: '2.0',
      id: req.id,
      method: req.method,
      params: req.params,
    };
    app.appApi.callWalletApi(JSON.stringify(request));
    return true;
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
    storageLocal.set({
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
    storageLocal.set({
      sites: [],
    });
  }

  static async saveWallet(pass: string) {
    const data = await passworder.encrypt(pass, Date.now());
    storageLocal.remove(['wallet']);
    storageLocal.set({ wallet: data });
    return data;
  }

  static removeWallet() {
    WasmWalletClient.DeleteWallet(PATH_DB);
    indexedDB.deleteDatabase('/beam_wallet');
    storageLocal.remove(['wallet']);
  }

  static checkPassword(pass: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (pass === '') {
        reject(ErrorMessage.EMPTY);
        return;
      }

      storageLocal.get('wallet', ({ wallet }) => {
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

  static generateAppID(appname: string, appurl: string): string {
    return WasmWalletClient.GenerateAppID(appname, appurl);
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

      const { Amount: amount, AssetID: id, PeerID: peer_id } = result.params;

      return {
        amount: !amount ? null : parseFloat(amount) / GROTHS_IN_BEAM,
        asset_id: !id ? null : parseInt(id, 10),
        peer_id,
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

  // eslint-disable-next-line no-spaced-func
  private remoteResponseHandlers = new Map<number | null, (data: any) => void>();

  registerResponseHandler(id: number | null, handler: (data: any) => void) {
    this.remoteResponseHandlers.set(id, handler);
  }

  removeResponseHandler(id: number | null) {
    this.remoteResponseHandlers.delete(id);
  }

  async init(handler: WalletEventHandler, notification: Notification, is_running?: boolean) {
    this.eventHandler = handler;

    if (is_running !== undefined ? is_running : this.isRunning()) {
      this.emitConnected({
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

      this.emitConnected({
        is_running: false,
        onboarding: !WasmWalletClient.IsInitialized(PATH_DB),
        notification,
      });
    } catch {
      this.emitConnected({
        is_running: false,
        onboarding: true,
        notification: null,
      });
    }
  }

  initContractInfoHandler(handler) {
    this.contractInfoHandler = handler;
  }

  registerContractInfoCallback(req, cb) {
    this.contractInfoCallbacks.set(String(req), cb);
  }

  initSendHandler(handler) {
    this.sendHandler = handler;
  }

  registerSendCallback(req, cb) {
    this.sendCallbacks.set(String(req), cb);
  }

  private static takeCallback(store: Map<string, any>, req: any, kind: string) {
    const key = String(req);
    const cb = store.get(key);
    if (!cb) {
      // eslint-disable-next-line no-console
      console.warn(`No pending ${kind} callback for request ${key} (already resolved?)`);
      return null;
    }
    store.delete(key);
    return cb;
  }

  emit(id: number | RPCEvent | BackgroundEvent, result?: any, error?: any) {
    this.trackSyncState(id, result);
    this.eventHandler({
      id,
      result,
      error,
    });
  }

  /** Every CONNECTED goes out with the current sync snapshot attached, so the UI can route on it. */
  private emitConnected(data: { is_running: boolean; onboarding: boolean; notification: any }) {
    this.emit(BackgroundEvent.CONNECTED, {
      ...data,
      sync_state: this.getSyncState(),
    });
  }

  getSyncState(): SyncStateSnapshot {
    return { ...this.syncState };
  }

  /**
   * Mirror every sync-related event into `syncState` so a UI that connects later
   * can be handed the current progress instead of starting from zero.
   */
  private trackSyncState(id: number | RPCEvent | BackgroundEvent, result: any) {
    if (result == null) return;

    switch (id) {
      case BackgroundEvent.CHANGE_SYNC_STEP:
        this.syncState.step = result as SyncStep;
        break;
      case BackgroundEvent.DOWNLOAD_DB_PROGRESS:
        this.syncState.step = SyncStep.DOWNLOAD;
        this.syncState.download_progress = { done: result.done, total: result.total };
        break;
      case BackgroundEvent.RESTORE_DB_PROGRESS:
        this.syncState.step = SyncStep.RESTORE;
        this.syncState.restore_progress = { done: result.done, total: result.total };
        break;
      case RPCEvent.SYNC_PROGRESS: {
        const {
          current_state_hash, tip_state_hash, sync_requests_done, sync_requests_total,
        } = result;
        this.syncState.is_synced = current_state_hash === tip_state_hash;
        if (!this.syncState.is_synced && sync_requests_done !== 0) {
          this.syncState.step = SyncStep.SYNC;
          this.syncState.sync_progress = { sync_requests_done, sync_requests_total };
        }
        break;
      }
      default:
        break;
    }
  }

  async start(pass: string) {
    // Reaching here means the password already checked out. Clear the flag in the
    // engine rather than waiting for the UI to round-trip it back to us.
    await setWalletLocked(false);

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
            Object.keys(this.apps).forEach((url: string) => {
              this.emitToExternalApp(url, JSON.stringify({ is_locked: false }));
            });
          }
          this.emit(BackgroundEvent.CLOSE_NOTIFICATION);
        } else {
          const notification = {
            type: 'connect',
            params: notificationManager.notification.params,
          };
          this.emitConnected({
            onboarding: false,
            is_running: true,
            notification,
          });
        }
      } else {
        this.emitConnected({
          onboarding: false,
          is_running: true,
          notification: null,
        });
      }
      return;
    }
    this.emit(BackgroundEvent.UNLOCK_WALLET, false);

    if (!this.wallet) {
      this.wallet = new WasmWalletClient(PATH_DB, pass, config.path_node, MyModule.Network.mainnet);
    }

    const responseHandler = (response) => {
      const event = JSON.parse(response);
      // WASM events bypass emit(), so mirror them into the sync snapshot here too.
      this.trackSyncState(event.id, event.result);
      this.eventHandler(event);
      this.remoteResponseHandlers.forEach((handler) => {
        handler(event);
      });
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
    this.send(RPCMethod.SubUnsub, {
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

  replayStateToUi() {
    if (!this.isRunning()) return;
    this.toggleEvents(false);
    this.toggleEvents(true);
  }

  getConnectedSnapshot(): ConnectedData {
    let onboarding = true;
    try {
      onboarding = this.mounted ? !WasmWalletClient.IsInitialized(PATH_DB) : true;
    } catch {
      onboarding = true;
    }
    return {
      is_running: this.isRunning(),
      onboarding,
      notification: notificationManager.notification ?? null,
      sync_state: this.getSyncState(),
    };
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
      storageLocal.get('sites', ({ sites }) => {
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
    const sites = this.connectedApps.filter((el) => el.appUrl !== site.appUrl || el.appName !== site.appName);

    this.connectedApps = [...sites];

    storageLocal.set({
      sites: this.connectedApps,
    });

    return this.connectedApps;
  }

  addConnectedSite(site: ExternalAppConnection) {
    const isExist = this.connectedApps.find((item: ExternalAppConnection) => item.appUrl === site.appUrl);
    if (!isExist) {
      this.connectedApps = [...this.connectedApps, site];
      storageLocal.set({
        sites: this.connectedApps,
      });
    }
  }

  disconnectAppApi(url) {
    if (this.apps[url]) {
      this.apps[url].appApi.delete();
      delete this.apps[url].appApi;
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
    if (WasmWallet.isInitialized()) {
      WasmWallet.removeWallet();
    }

    // Must complete before we report success: without the password verifier blob
    // on disk, checkPassword() can never succeed against the new wallet.
    await WasmWallet.saveWallet(password);
    WasmWallet.initSettings(isSeedConfirmed);
    WasmWallet.initConnectedSites();

    WasmWalletClient.CreateWallet(seed, PATH_DB, password);
    if (!this.wallet) {
      this.wallet = new WasmWalletClient(PATH_DB, password, config.path_node, MyModule.Network.mainnet);
    }
    await this.fastSync();

    await this.start(password);
  }

  stop() {
    // The snapshot describes a wallet that no longer runs — drop it so the next
    // UI doesn't rehydrate stale progress.
    this.syncState = {
      step: SyncStep.SYNC,
      is_synced: false,
      sync_progress: null,
      download_progress: null,
      restore_progress: null,
    };

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
      notificationManager.sendAuthResponse(
        {
          result: false,
          errcode: -1,
          ermsg: 'Unsupported API version required',
        },
        params.appurl,
      );
      return;
    }
    try {
      const appApi = await this.createAppAPI(
        params.apiver,
        params.apivermin,
        params.appurl,
        params.appname,
        (json: string) => {
          // WASM invokes this synchronously per response; the mirror is hydrated
          // long before any app API exists, and callExternalWalletApi already did
          // the authoritative check on the way in.
          if (!isWalletLockedSync()) {
            this.emitToExternalApp(params.appurl, json);
          } else {
            // Preserve the response id so inpage can resolve/reject the pending call.
            let id: unknown;
            try {
              ({ id } = JSON.parse(json));
            } catch {
              /* ignore */
            }
            this.emitToExternalApp(
              params.appurl,
              JSON.stringify({ jsonrpc: '2.0', id: id ?? null, error: { code: -5, message: 'Wallet is locked' } }),
            );
          }
        },
      );

      this.apps[params.appurl] = {
        appApi,
        appname: params.appname,
        appurl: params.appurl,
      };
      notificationManager.sendAuthResponse({ result: true }, params.appurl);
    } catch (err) {
      notificationManager.sendAuthResponse(
        {
          result: false,
          errcode: -2,
          ermsg: err,
        },
        params.appurl,
      );
    }
  }

  async deleteWallet(pass: string) {
    await WasmWallet.checkPassword(pass);
    await this.stop();
    return WasmWallet.removeWallet();
  }

  lockWallet() {
    Object.keys(this.apps).forEach((url: string) => {
      this.emitToExternalApp(
        url,
        JSON.stringify({
          error: true,
          errcode: -5,
          errormsg: 'Wallet is locked',
        }),
      );
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
        this.emitConnected({
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
      this.connectExternal(params).catch((err) => {
        // eslint-disable-next-line no-console
        console.error('connectExternal failed after approval:', err);
      });
      return null;
    }
    return notificationManager.sendAuthResponse(
      {
        result: false,
        errcode: -3,
        ermsg: 'Connection rejected',
      },
      params.appurl,
    );
  }

  notificationApproveInfo(params: any) {
    if (params.req === undefined || params.req === null) return;
    WasmWallet.takeCallback(this.contractInfoCallbacks, params.req, 'contract info')?.contractInfoApproved(params.req);
  }

  notificationRejectInfo(params: any) {
    if (params.req === undefined || params.req === null) return;
    WasmWallet.takeCallback(this.contractInfoCallbacks, params.req, 'contract info')?.contractInfoRejected(params.req);
  }

  notificationApproveSend(params: any) {
    if (params.req === undefined || params.req === null) return;
    WasmWallet.takeCallback(this.sendCallbacks, params.req, 'send')?.sendApproved(params.req);
  }

  notificationRejectSend(params: any) {
    if (params.req === undefined || params.req === null) return;
    WasmWallet.takeCallback(this.sendCallbacks, params.req, 'send')?.sendRejected(params.req);
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
        try {
          await this.create(params);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('createWallet failed:', error);
          this.emit(id, null, error);
        }
        break;
      case WalletMethod.StartWallet:
        try {
          await WasmWallet.checkPassword(params);
          await this.start(params);
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
            this.emitConnected({
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
          this.connectExternal(params).catch((err) => {
            // eslint-disable-next-line no-console
            console.error('connectExternal failed in NotificationConnect:', err);
          });
        } else {
          notificationManager.sendAuthResponse(
            {
              result: false,
              errcode: -3,
              ermsg: 'Connection rejected',
            },
            params.appurl,
          );
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
        this.notificationApproveInfo(params);
        break;
      case WalletMethod.NotificationRejectInfo:
        this.notificationRejectInfo(params);
        break;
      case WalletMethod.NotificationApproveSend:
        this.notificationApproveSend(params);
        break;
      case WalletMethod.NotificationRejectSend:
        this.notificationRejectSend(params);
        break;
      case WalletMethod.LoadBackgroundLogs:
        this.emit(id, WasmWallet.loadLogs());
        break;
      case WalletMethod.WalletLocked:
        Object.keys(this.apps).forEach((url: string) => {
          this.emitToExternalApp(
            url,
            JSON.stringify({
              error: true,
              errcode: -5,
              errormsg: 'Wallet is locked',
            }),
          );
        });

        break;
      default:
        break;
    }

    return null;
  }

  send(method: RPCMethod | WalletMethod, params?: any) {
    const internal = Object.values(WalletMethod).includes(method as WalletMethod);
    const id = this.counter;
    this.counter += 1;

    if (internal) {
      try {
        this.callInternal(id, method as WalletMethod, params);
      } catch (error) {
        this.emit(id, null, error);
      }
      return null;
    }

    this.wallet.sendRequest(
      JSON.stringify({
        jsonrpc: '2.0',
        id,
        method,
        params,
      }),
    );

    return id;
  }
}
