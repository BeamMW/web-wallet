import { createEvent, restore, combine } from 'effector';

import {
  Asset,
  AssetsEvent,
  Transaction,
  TxsEvent,
  WalletTotal,
} from '@core/types';
import Entity from './Entity';

const BEAM_METADATA: Partial<Asset> = {
  metadata_pairs: {
    N: 'BEAM',
    SN: 'BEAM',
  },
};

export const assets = new Entity<Asset, AssetsEvent>('assets', 'asset_id');
export const transactions = new Entity<Transaction, TxsEvent>('txs', 'txId');

export const $assets = assets.getStore();
export const $transactions = transactions.getStore();

export const setTotals = createEvent<WalletTotal[]>();

export const $totals = restore(setTotals, []);

export const $balance = combine($totals, $assets, (totals, assets) => {
  return totals.map(({ asset_id, available, maturing, receiving, sending }) => {
    const target =
      asset_id === 0
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
  });
});
