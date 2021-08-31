import * as extensionizer from 'extensionizer';
import * as passworder from 'browser-passworder';

import { isNil } from '@core/utils';
import { RPCMethod, RPCEvent, ToggleSubscribeToParams } from './types';

declare const BeamModule: any;

const PATH_DB = '/beam_wallet/wallet.db';
const PATH_NODE = 'eu-node01.masternet.beam.mw:8200';

let WasmWalletClient;
export interface WalletEvent<T = any> {
  id: RPCMethod | RPCEvent;
  result: T;
}

type WalletEventHandler = {
  (event: WalletEvent): void;
};

function load<T>(name: string): Promise<T> {
  return new Promise<T>((resolve) => {
    extensionizer.storage.local.get(name, (result) => {
      const value = result[name];
      resolve(value);
    });
  });
}
export default class WasmWallet {
  private static instance: WasmWallet;

  static getInstance() {
    if (this.instance != null) {
      return this.instance;
    }
    this.instance = new WasmWallet();
    return this.instance;
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
    return new Promise<boolean>((resolve, reject) => {
      extensionizer.storage.local.get('wallet', ({ wallet }) => {
        passworder.decrypt(pass, wallet).then(resolve).catch(reject);
      });
    });
  }

  static isAllowedWord(word: string): boolean {
    return WasmWalletClient.IsAllowedWord(word);
  }

  static getSeedPhrase() {
    const seed: string = WasmWalletClient.GeneratePhrase();
    return seed.split(' ');
  }

  private wallet: any;

  private mounted: boolean = false;

  private created: boolean = false;

  private eventHandler: WalletEventHandler;

  async init(handler: WalletEventHandler) {
    this.eventHandler = handler;
    const module = await BeamModule();
    WasmWalletClient = module.WasmWalletClient;
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

  mount() {
    return new Promise((resolve) => {
      WasmWalletClient.MountFS(() => {
        this.mounted = true;
        resolve(true);
      });
    });
  }

  async open(pass: string) {
    if (!this.mounted) {
      await this.mount();
    }

    this.start(pass);
  }

  async create(seed: string, pass: string, seedConfirmed: boolean) {
    try {
      await this.saveWallet(seed, pass);
      WasmWallet.initSettings(seedConfirmed);

      if (!this.mounted) {
        await this.mount();
      }

      if (this.created) {
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

  // eslint-disable-next-line
  async saveWallet(seed: string, pass: string) {
    const data = await passworder.encrypt(pass, { seed });
    extensionizer.storage.local.remove(['wallet']);
    extensionizer.storage.local.set({ wallet: data });
    return data;
  }

  async checkWallet() {
    try {
      const data = await load<string>('wallet');
      const result = !isNil(data);
      this.created = result;
      return result;
    } catch {
      return false;
    }
  }

  send<T>(method: RPCMethod, params?: T) {
    this.wallet.sendRequest(
      JSON.stringify({
        jsonrpc: '2.0',
        id: method,
        method,
        params,
      }),
    );
  }
}
