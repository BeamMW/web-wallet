import { combine, createEvent, createStore, restore, sample } from 'effector';

import {
  Asset,
  AssetsEvent,
  createAddress,
  getWalletStatus,
  SyncProgressData,
  Transaction,
  TxsEvent,
  WalletStatusData,
  WalletTotal,
} from './api';
import WasmWallet, { WalletEvent, RPCEvent, RPCMethod } from '@wallet';

export enum View {
  LOGIN,
  CREATE,
  RESTORE,
  SET_PASSWORD,
  PROGRESS,
  PORTFOLIO,
}

export const setView = createEvent<View>();
export const setSeed = createEvent<string[]>();
export const setReady = createEvent<boolean>();
export const setSyncProgress = createEvent<[number, number]>();
export const setTotals = createEvent<WalletTotal[]>();
export const setMeta = createEvent<Asset[]>();
export const setTransactions = createEvent<Transaction[]>();

export const sendWalletEvent = createEvent<WalletEvent>();

export const $view = restore(setView, View.LOGIN);
export const $seed = restore(setSeed, null);
export const $ready = restore(setReady, false);
export const $syncProgress = restore(setSyncProgress, [0, 0]);

export const $syncPercent = $syncProgress.map<number>((state, last) => {
  const [done, total] = state;
  const next = done === 0 ? 0 : Math.floor((done / total) * 100);
  if (last >= next) {
    return last;
  }
  return next;
});

const BEAM_METADATA: Partial<Asset> = {
  metadata_pairs: {
    N: 'BEAM',
    SN: 'BEAM',
  },
};

export const $totals = restore(setTotals, []);
export const $meta = restore(setMeta, []);

export const $balance = combine($totals, $meta, (totals, meta) => {
  return totals.map(({ asset_id, available, maturing, receiving, sending }) => {
    const target =
      asset_id === 0
        ? BEAM_METADATA
        : meta.find(({ asset_id: id }) => asset_id === id);

    const { metadata_pairs: pairs } = target;

    return {
      name: pairs.N,
      short: pairs.SN,
      asset_id,
      available,
      maturing,
      receiving,
      sending,
    };
  });
});

export const $transactions = restore(setTransactions, []);

function handleSyncProgress(
  ready: boolean,
  { done, total, current_state_hash, tip_state_hash }: SyncProgressData,
) {
  if (!ready && current_state_hash === tip_state_hash) {
    setReady(true);
    setView(View.PORTFOLIO);
    getWalletStatus();
    createAddress();
  } else {
    setSyncProgress([done, total]);
  }
}

function handleWalletStatus({ totals }: WalletStatusData) {
  setTotals(totals);
}

function handleAssetsChanged({ change, assets }: AssetsEvent) {
  switch (change) {
    case 3: // reset
      setMeta(assets);
      break;
    default:
  }
}

function handleTxsChanged({ change, txs }: TxsEvent) {
  switch (change) {
    case 3: // reset
      setTransactions(txs);
      break;
    default:
  }
}

sample({
  source: $ready,
  clock: sendWalletEvent,
  fn: (ready, { id, result }) => {
    switch (id) {
      case RPCEvent.SYNC_PROGRESS:
        handleSyncProgress(ready, result);
        break;
      case RPCEvent.ASSETS_CHANGED:
        handleAssetsChanged(result);
        break;
      case RPCEvent.SYSTEM_STATE:
        getWalletStatus();
        break;
      case RPCEvent.TXS_CHANGED:
        handleTxsChanged(result);
        break;
      case RPCMethod.GetWalletStatus:
        handleWalletStatus(result);
        break;
      case RPCMethod.CreateAddress:
        break;
      default:
        break;
    }
  },
});

export const initWallet = () => {
  WasmWallet.getInstance().init(sendWalletEvent);
};
