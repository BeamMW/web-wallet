import {
  createEvent, restore, combine, Store,
} from 'effector';

import {
  Asset,
  AssetsEvent,
  RPCEvent,
  RPCMethod,
  Transaction,
  TxsEvent,
  WalletStatus,
  WalletTotal,
} from '@core/types';

import Entity from '@core/Entity';
import { handleWalletEvent } from '@app/model';
import { getWalletStatus } from '@app/core/api';

export interface Balance {
  name: string;
  short: string;
  asset_id: number;
  available: number;
  maturing: number;
  receiving: number;
  sending: number;
}

const BEAM_METADATA: Partial<Asset> = {
  metadata_pairs: {
    N: 'BEAM',
    SN: 'BEAM',
  },
};

export const $$assets = new Entity<Asset, AssetsEvent>('assets', 'asset_id');
export const $$transactions = new Entity<Transaction, TxsEvent>('txs', 'txId');

export const setTotals = createEvent<WalletTotal[]>();

export const $totals = restore(setTotals, []);
export const $assets = $$assets.getStore();
export const $transactions = $$transactions.getStore();

export const $balance: Store<Balance[]> = combine($totals, $assets, (totals, assets) => (
  totals.map(({
    asset_id, available, maturing, receiving, sending,
  }) => {
    const target = asset_id === 0
      ? BEAM_METADATA
      : assets.find(({ asset_id: id }) => asset_id === id);

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
  })
));

// receive Wallet Status
handleWalletEvent<WalletStatus>(
  RPCMethod.GetWalletStatus,
  ({ totals }) => setTotals(totals),
);

// receive System State
handleWalletEvent<any>(
  RPCEvent.SYSTEM_STATE,
  () => getWalletStatus(),
);

// receive Assets
handleWalletEvent<AssetsEvent>(
  RPCEvent.ASSETS_CHANGED,
  (payload) => $$assets.push(payload),
);

// receive Transactions
handleWalletEvent<TxsEvent>(
  RPCEvent.TXS_CHANGED,
  (payload) => $$transactions.push(payload),
);
