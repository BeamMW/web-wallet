import { createEvent, restore, combine } from 'effector';

import { Asset, Transaction, WalletTotal } from '@core/types';

const BEAM_METADATA: Partial<Asset> = {
  metadata_pairs: {
    N: 'BEAM',
    SN: 'BEAM',
  },
};

export const setTotals = createEvent<WalletTotal[]>();
export const setMeta = createEvent<Asset[]>();
export const setTransactions = createEvent<Transaction[]>();

export const $totals = restore(setTotals, []);
export const $meta = restore(setMeta, []);
export const $transactions = restore(setTransactions, []);

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
