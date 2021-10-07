import {
  combine,
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
import { handleWalletEvent } from '@core/api';
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

const META_BLANK: Partial<Asset> = {
  metadata_pairs: {
    N: '',
    SN: '',
    UN: '',
  },
};

const META_BEAM: Partial<Asset> = {
  metadata_pairs: {
    N: 'BEAM',
    SN: 'BEAM',
    UN: 'BEAM',
  },
};

export const $$assets = new Entity<Asset, AssetsEvent>('assets', 'asset_id');
export const $$transactions = new Entity<Transaction, TxsEvent>('txs', 'txId');

export const setTotals = createEvent<WalletTotal[]>();

export const $totals = restore(setTotals, []);
export const $transactions = $$transactions.getStore();

export type AssetTotal = WalletTotal & Partial<Asset>;

function getMetadata(assets: Asset[], id: number): Partial<Asset> {
  if (id === 0) {
    return META_BEAM;
  }

  return assets.find(({ asset_id }) => asset_id === id) ?? META_BLANK;
}

export const $assets: Store<AssetTotal[]> = combine(
  $totals, $$assets.getStore(),
  (totals, assets) => totals.map(
    (data) => {
      const target = getMetadata(assets, data.asset_id);
      return {
        ...data,
        ...target,
      };
    },
  ),
);

export const $options = $assets
  .map((arr) => arr.map((item) => item.metadata_pairs.N));

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
