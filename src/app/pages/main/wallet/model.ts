import {
  createEvent, restore, Store,
} from 'effector';

import {
  Asset,
  AssetsEvent,
  RPCEvent,
  Transaction,
  TxsEvent,
  WalletTotal,
} from '@core/types';

import Entity from '@core/Entity';
import { handleWalletEvent } from '@app/model';
import { getWalletStatus } from '@app/core/api';

export const PALLETE_ASSETS = [
  '#72fdff',
  '#2acf1d',
  '#ffbb54',
  '#d885ff',
  '#008eff',
  '#ff746b',
  '#91e300',
  '#ffe75a',
  '#9643ff',
  '#395bff',
  '#ff3b3b',
  '#73ff7c',
  '#ffa86c',
  '#ff3abe',
  '#0aaee1',
  '#ff5200',
  '#6464ff',
  '#ff7a21',
  '#63afff',
  '#c81f68',
];

export interface AssetMap {
  [id: number]: Partial<Asset>;
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
export const $transactions = $$transactions.getStore();

export const $assets: Store<AssetMap> = $$assets
  .getStore()
  .map((assets) => (
    assets.reduce((result, item) => {
      // eslint-disable-next-line
      result[item.asset_id] = item;
      return result;
    }, {
      0: BEAM_METADATA,
    })
  ));

// receive System State
handleWalletEvent<any>(
  RPCEvent.SYSTEM_STATE,
  // receive Wallet Status
  async () => {
    const { totals } = await getWalletStatus();
    setTotals(totals);
  },
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
