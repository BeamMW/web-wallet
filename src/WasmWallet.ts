import * as extensionizer from 'extensionizer';
import * as passworder from 'browser-passworder';

import { isNil } from '@shared/utils';

declare const BeamModule: any;

export enum RPCMethod {
  ToggleSubscribeTo = 'ev_subunsub',
  GetAssetInfo = 'get_asset_info',
  GetWalletStatus = 'wallet_status',
  GetAddressList = 'addr_list',
  GetUTXO = 'get_utxo',
  GetTXList = 'tx_list',
}

export enum RPCEvent {
  SYNC_PROGRESS = 'ev_sync_progress',
}
export interface ToggleSubscribeToParams {
  ev_sync_progress?: boolean;
  ev_system_state?: boolean;
  ev_assets_changed?: boolean;
  ev_addrs_changed?: boolean;
  ev_utxos_changed?: boolean;
  ev_txs_changed?: boolean;
}

const PATH_DB = '/beam_wallet/wallet.db';
const PATH_NODE = 'eu-node01.masternet.beam.mw:8200';

let counter = 0;
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
      console.info(event.id, event.result);
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
      await this.save(seed, pass);
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

  async save(seed: string, pass: string) {
    const data = await passworder.encrypt(pass, { seed });
    extensionizer.storage.local.remove(['wallet']);
    extensionizer.storage.local.set({ wallet: data });
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

  getSeedPhrase(): string {
    return WasmWalletClient.GeneratePhrase();
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
