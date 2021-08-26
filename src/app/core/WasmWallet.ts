import * as extensionizer from 'extensionizer';
import * as passworder from 'browser-passworder';

import { isNil } from '@core/utils';
import { RPCMethod, RPCEvent, ToggleSubscribeToParams } from './types';

declare const BeamModule: any;

const PATH_DB = '/beam_wallet/wallet.db';
const PATH_NODE = 'eu-node01.masternet.beam.mw:8200';

let WasmWalletClient;
export interface WalletEvent {
  id: RPCMethod | RPCEvent;
  result: any;
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

  private wallet: any;
  private mounted: boolean = false;
  private eventHandler: WalletEventHandler;

  constructor() {}

  init(handler: WalletEventHandler) {
    this.eventHandler = handler;

    BeamModule().then(module => {
      WasmWalletClient = module.WasmWalletClient;
    });
  }

  start(pass: string) {
    if (isNil(this.wallet)) {
      this.wallet = new WasmWalletClient(PATH_DB, pass, PATH_NODE);
    }

    const responseHandler = response => {
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

  mount(onMount: Function) {
    WasmWalletClient.MountFS(() => {
      this.mounted = true;
      onMount();
    });
  }

  open(pass: string) {
    const onMount = () => this.start(pass);

    if (!this.mounted) {
      this.mount(onMount);
    } else {
      onMount();
    }
  }

  create(seed: string, pass: string, seedConfirmed: boolean) {
    WasmWalletClient.DeleteWallet(PATH_DB);

    this.saveWallet(seed, pass).then(() => {
      this.initSettings(seedConfirmed);

      const onMount = () => {
        WasmWalletClient.CreateWallet(seed, PATH_DB, pass);
        this.start(pass);
      };

      if (!this.mounted) {
        this.mount(onMount);
      } else {
        onMount();
      }
    });
  }

  stop() {
    return new Promise((resolve, reject) => {
      if (isNil(this.wallet)) {
        resolve(true);
        return;
      }

      this.wallet.stopWallet(data => {
        const running = this.wallet.isRunning();
        console.log('is running: ' + this.wallet.isRunning());
        console.log('wallet stopped:', data);

        if (running) {
          reject(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  saveWallet(seed: string, pass: string) {
    return passworder.encrypt(pass, { seed }).then(data => {
      extensionizer.storage.local.remove(['wallet']);
      extensionizer.storage.local.set({ wallet: data });
    });
  }

  private load<T>(name: string): Promise<T> {
    return new Promise<T>(resolve => {
      extensionizer.storage.local.get(name, result => {
        const value = result[name];
        resolve(value);
      });
    });
  }

  loadWallet() {
    return this.load<string>('wallet');
  }

  checkPassword(pass: string) {
    return new Promise<boolean>((resolve, reject) => {
      extensionizer.storage.local.get('wallet', ({ wallet }) => {
        passworder.decrypt(pass, wallet).then(resolve).catch(reject);
      });
    });
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

  isAllowedWord(word: string): boolean {
    return WasmWalletClient.IsAllowedWord(word);
  }

  getSeedPhrase() {
    const seed: string = WasmWalletClient.GeneratePhrase();
    return seed.split(' ');
  }

  initSettings(seedConfirmed: boolean) {
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
}
