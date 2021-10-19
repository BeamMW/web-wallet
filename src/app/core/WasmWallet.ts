import * as extensionizer from 'extensionizer';
import * as passworder from 'browser-passworder';
import PortStream from '@core/PortStream';

import { isNil } from '@core/utils';
import { GROTHS_IN_BEAM } from '@app/model/rates';
import {
  RPCMethod,
  RPCEvent,
  BackgroundEvent,
  WalletMethod,
  CreateWalletParams,
  Notification,
} from './types';
import NotificationManager from './NotificationManager';
import DnodeApp from './DnodeApp';

declare const BeamModule: any;

const PATH_DB = '/beam_wallet/wallet.db';
const PATH_NODE = 'eu-node01.mainnet.beam.mw:8200';

let WasmWalletClient;
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

let bgLogs = {
  common: [],
  commonDef: console.log.bind(console),
  errors: [],
  errorsDef: console.error.bind(console),
  warns: [],
  warnsDef: console.warn.bind(console),
}

console.log = function() {
  bgLogs.commonDef.apply(console, arguments);
  bgLogs.common.push(Array.from(arguments));
}
console.error = function() {
  bgLogs.errorsDef.apply(console, arguments);
  bgLogs.errors.push(Array.from(arguments));
}
console.warn = function() {
  bgLogs.warnsDef.apply(console, arguments);
  bgLogs.warns.push(Array.from(arguments));
}

export default class WasmWallet {
  private static instance: WasmWallet;

  private contractInfoHandler;

  private contractInfoHandlerCallback;

  // TODO:BRO map [url->app]
  private apps = {};

  static getInstance() {
    if (this.instance != null) {
      return this.instance;
    }
    this.instance = new WasmWallet();
    return this.instance;
  }

  static async mount(): Promise<boolean> {
    const module = await BeamModule();
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
        passworder.decrypt(pass, wallet).then(() => {
          resolve(pass);
        }).catch(() => {
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

  static isAppSupported(apiver:string, apivermin: string): boolean {
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

      const {
        Amount: amount,
        AssetID: id,
      } = result.params;

      return {
        amount: isNil(amount) ? null : parseFloat(amount) / GROTHS_IN_BEAM,
        asset_id: isNil(id) ? null : parseInt(id, 10),
      };
    } catch (error) {
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

  async init(handler: WalletEventHandler, notification: Notification) {
    this.eventHandler = handler;

    if (this.isRunning()) {
      this.emit(BackgroundEvent.CONNECTED, {
        onboarding: false,
        is_running: true,
        notification: !isNil(notification) ? notification : null,
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
        notification: !isNil(notification) ? notification : null,
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

  emit(
    id: number | RPCEvent | BackgroundEvent,
    result?: any,
    error?: any,
  ) {
    console.info(`emitted event "${id}" with`, result);
    this.eventHandler({
      id,
      result,
      error,
    });
  }

  start(pass: string) {
    if (isNil(this.wallet)) {
      this.wallet = new WasmWalletClient(PATH_DB, pass, PATH_NODE);
    }

    const responseHandler = (response) => {
      const event = JSON.parse(response);
      console.info(event);
      this.eventHandler(event);
    };

    this.wallet.startWallet();
    this.wallet.subscribe(responseHandler);
    this.wallet.setApproveContractInfoHandler(this.contractInfoHandler);

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
    return isNil(this.wallet) ? false : this.wallet.isRunning();
  }

  async createAppAPI(
    apiver: string,
    apivermin: string,
    appurl: string,
    appname:string,
    handler: any,
  ) {
    return new Promise((resolve, reject) => {
      const appid = WasmWallet.generateAppID(appname, appurl);
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

  setApproveSendHandler(handler) {
    this.wallet.setApproveSendHandler(handler);
  }

  setApproveContractInfoHandler(handler) {
    this.wallet.setApproveContractInfoHandler(handler);
  }

  async create({
    seed,
    password,
    isSeedConfirmed,
  }: CreateWalletParams) {
    try {
      if (WasmWallet.isInitialized()) {
        WasmWallet.removeWallet();
      }

      WasmWallet.saveWallet(password);
      WasmWallet.initSettings(isSeedConfirmed);

      WasmWalletClient.CreateWallet(seed, PATH_DB, password);
      this.start(password);
    } catch (error) {
      console.error(error);
    }
  }

  stop() {
    return new Promise((resolve, reject) => {
      if (isNil(this.wallet)) {
        resolve(true);
        return;
      }

      this.wallet.stopWallet((data) => {
        const running = this.wallet.isRunning();
        console.log(`is running: ${this.wallet.isRunning()}`);
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
        const result = params === ''
          ? null : WasmWallet.isAllowedWord(params);
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
          this.emit(id);
        } catch (error) {
          this.emit(id, null, error);
        }
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
      case WalletMethod.NotificationConnect:
        // eslint-disable-next-line no-case-declarations
        const notificationPort = NotificationManager.getReqPort();
        if (params.result) {
          if (!WasmWallet.isAppSupported(params.apiver, params.apivermin)) {
            return notificationPort.postMessage({
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
            const portStream = new PortStream(NotificationManager.getPort());
            this.apps[params.appurl].connectPage(portStream, params.appurl);
            notificationPort.postMessage({
              result: true,
            });
          } catch (err) {
            // TODO:BRO handle error in Utils.js
            notificationPort.postMessage({
              result: false,
              errcode: -2,
              ermsg: err,
            });
          }
        }
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
      case WalletMethod.LoadBackgroundLogs:
        this.emit(id, WasmWallet.loadLogs());
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
