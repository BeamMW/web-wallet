import * as extensionizer from 'extensionizer';
import * as passworder from 'browser-passworder';

import { isNil } from '@utils';
import { RPCMethod, RPCEvent, ToggleSubscribeToParams } from '@api';
import { setSyncProgress } from '@root';

declare const BeamModule: any;

const PATH_DB = '/beam_wallet/wallet.db';
const PATH_NODE = 'eu-node01.masternet.beam.mw:8200';

let counter = 0;
let WasmWalletClient;
export default class WasmWallet {
  private static instance: WasmWallet;

  static getInstance() {
    if (this.instance != null) {
      return this.instance;
    }

    return new WasmWallet();
  }

  private wallet: any;
  private ready: boolean;
  private mounted: boolean = false;

  constructor() {}

  handleResponse = (response: string) => {
    const event = JSON.parse(response);
    console.log(event.id, event.result);
    switch (event.id) {
      case RPCEvent.SYNC_PROGRESS:
        const { done, total } = event.result;
        setSyncProgress([done, total]);
        break;
      default:
        break;
    }
  };

  init() {
    BeamModule().then(module => {
      this.ready = true;
      WasmWalletClient = module.WasmWalletClient;
    });
  }

  start(pass: string) {
    if (isNil(this.wallet)) {
      this.wallet = new WasmWalletClient(PATH_DB, pass, PATH_NODE);
    }

    this.wallet.startWallet();

    this.wallet.subscribe(this.handleResponse);

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

  async create(seed: string, pass: string, seedConfirmed: boolean) {
    try {
      const data = await passworder.encrypt(pass, { seed });
      this.save(data);
      this.initSettings(seedConfirmed);

      if (!this.mounted) {
        await this.mount();
      }

      WasmWalletClient.CreateWallet(seed, '/beam_wallet/wallet.db', pass);
      this.start(pass);
    } catch (error) {
      console.log(error);
    }
  }

  save(data) {
    extensionizer.storage.local.remove(['wallet']);
    extensionizer.storage.local.set({ wallet: data });
  }

  send<T>(method: RPCMethod, params: T) {
    this.wallet.sendRequest(
      JSON.stringify({
        jsonrpc: '2.0',
        id: counter++,
        method,
        params,
      }),
    );
  }

  isAllowedWord(word: string): boolean {
    return WasmWalletClient.IsAllowedWord(word);
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
