import * as extensionizer from 'extensionizer';
import * as passworder from 'browser-passworder';

import { isNil } from '@core/utils';
import {
  RPCMethod, RPCEvent, BackgroundEvent, WalletMethod, CreateWalletParams,
} from './types';

declare const BeamModule: any;

const PATH_DB = '/beam_wallet/wallet.db';
const PATH_NODE = 'eu-node01.masternet.beam.mw:8200';

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

export default class WasmWallet {
  private static instance: WasmWallet;

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

  static isAllowedWord(word: string): boolean {
    return WasmWalletClient.IsAllowedWord(word);
  }

  static isInitialized(): boolean {
    return WasmWalletClient.IsInitialized(PATH_DB);
  }

  static generateSeed() {
    const seed: string = WasmWalletClient.GeneratePhrase();
    return seed.split(' ');
  }

  private wallet: typeof WasmWalletClient;

  private mounted: boolean = false;

  private eventHandler: WalletEventHandler;

  async init(handler: WalletEventHandler) {
    this.eventHandler = handler;

    if (this.isRunning()) {
      this.emit(BackgroundEvent.CONNECTED, {
        onboarding: false,
        is_running: true,
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
      });
    } catch {
      this.emit(BackgroundEvent.CONNECTED, {
        is_running: false,
        onboarding: true,
      });
    }
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

  createAppAPI(id: string, name: string, handler, apiSet) {
    this.wallet.createAppAPI(id, name, (api) => {
      apiSet(api);
      api.setHandler(handler);
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
      await WasmWallet.saveWallet(password);
      WasmWallet.initSettings(isSeedConfirmed);

      if (WasmWallet.isInitialized()) {
        WasmWallet.removeWallet();
      }

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
      case WalletMethod.GenerateSeed: {
        const result = WasmWallet.generateSeed();
        this.emit(id, result);
        break;
      }
      case WalletMethod.IsAllowedWord: {
        const result = WasmWallet.isAllowedWord(params);
        this.emit(id, result);
        break;
      }
      case WalletMethod.CreateWallet:
        this.create(params);
        break;
      case WalletMethod.StartWallet:
        await WasmWallet.checkPassword(params);
        this.start(params);
        break;
      case WalletMethod.DeleteWallet:
        await WasmWallet.checkPassword(params);
        WasmWallet.removeWallet();
        this.emit(id);
        break;
      default:
        break;
    }
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
