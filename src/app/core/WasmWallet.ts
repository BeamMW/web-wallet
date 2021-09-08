import * as extensionizer from 'extensionizer';

import { isNil } from '@core/utils';
import { RPCMethod, RPCEvent, ToggleSubscribeToParams } from './types';

declare const BeamModule: any;

const PATH_DB = '/beam_wallet/wallet.db';
const PATH_NODE = 'eu-node01.masternet.beam.mw:8200';

let WasmWalletClient;
export interface WalletEvent<T = any> {
  id: number | RPCEvent;
  result: T;
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
      WasmWalletClient.MountFS(() => {
        const result = WasmWalletClient.IsInitialized(PATH_DB);
        resolve(result);
      });
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

  static checkPassword(pass: string) {
    return WasmWalletClient.CheckPassword(PATH_DB, pass);
  }

  static isAllowedWord(word: string): boolean {
    return WasmWalletClient.IsAllowedWord(word);
  }

  static getSeedPhrase() {
    const seed: string = WasmWalletClient.GeneratePhrase();
    return seed.split(' ');
  }

  private wallet: typeof WasmWalletClient;

  private ready: boolean = false;

  private counter: number = 0;

  private eventHandler: WalletEventHandler;

  async init(handler: WalletEventHandler) {
    this.eventHandler = handler;
    this.ready = await WasmWallet.mount();
    return this.ready;
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

    this.send<ToggleSubscribeToParams>(RPCMethod.ToggleSubscribeTo, {
      ev_addrs_changed: true,
      ev_assets_changed: true,
      ev_sync_progress: true,
      ev_system_state: true,
      ev_txs_changed: true,
      ev_utxos_changed: true,
    });
  }

  async create(seed: string, pass: string, seedConfirmed: boolean) {
    try {
      WasmWallet.initSettings(seedConfirmed);

      if (this.ready) {
        WasmWalletClient.DeleteWallet(PATH_DB);
      }

      WasmWalletClient.CreateWallet(seed, PATH_DB, pass);
      this.start(pass);
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

  send<T>(method: RPCMethod, params?: T): number {
    const id = this.counter;
    this.counter += 1;
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
