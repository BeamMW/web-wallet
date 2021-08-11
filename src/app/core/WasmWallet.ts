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

  mount() {
    return new Promise<void>(resolve => {
      this.mounted = true;
      WasmWalletClient.MountFS(resolve);
    });
  }

  async open(pass: string) {
    try {
      if (!this.mounted) {
        await this.mount();
      }

      this.start(pass);
    } catch (error) {
      console.log(error);
    }
  }

  async create(seed: string, pass: string, seedConfirmed: boolean) {
    try {
      await this.saveWallet(seed, pass);
      this.initSettings(seedConfirmed);

      if (!this.mounted) {
        await this.mount();
      }

      WasmWalletClient.CreateWallet(seed, '/beam_wallet/wallet.db', pass);
      this.start(pass);
    } catch (error) {
      // if 32722064 delete wallet
      console.log(error);
    }
  }

  async saveWallet(seed: string, pass: string) {
    const data = await passworder.encrypt(pass, { seed });
    extensionizer.storage.local.remove(['wallet']);
    extensionizer.storage.local.set({ wallet: data });
  }

  private load<T>(name: string): Promise<T> {
    return new Promise<T>(resolve => {
      extensionizer.storage.local.get(name, result => {
        resolve(result[name]);
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
