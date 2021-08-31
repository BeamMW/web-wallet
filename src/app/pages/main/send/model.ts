import { $balance } from '@state/portfolio';
import {
  combine, createEffect, createEvent, restore, sample,
} from 'effector';
import { debounce } from 'patronum/debounce';

import { calculateChange } from '@core/api';
import { FEE_DEFAULT, GROTHS_IN_BEAM } from '@app/state/shared';
import React from 'react';

export const setSelected = createEvent<number>();

export const $options = $balance.map((state) => (
  state.map(({ name }) => name)
));

interface ChangeEvent extends React.ChangeEvent<HTMLInputElement> {}

export const onAmountInput = createEvent<ChangeEvent>();

const setAmount = createEvent<string>();

const REG_AMOUNT = /^(\d+\.?)?(\d+)?$/;

const setAmountSafe = onAmountInput
  .map(({ target }) => target.value)
  .filter({
    fn: (value) => REG_AMOUNT.test(value),
  });

export const $selected = restore(setSelected, 0);
export const $asset = combine($balance, $selected, (array, index) => array[index]);
export const $amount = restore(setAmount, '');

sample({
  source: $asset,
  clock: setAmountSafe,
  fn: ({ available }, value) => {
    const total = available / GROTHS_IN_BEAM;
    return parseFloat(value) > total
      ? total.toString() : value;
  },
  target: setAmount,
});

const setAmountDebounced = debounce({ source: setAmount, timeout: 200 });

const calculateChangeFx = createEffect((params) => calculateChange(params));

sample({
  source: $asset,
  clock: setAmountDebounced,
  fn: ({ asset_id }, payload) => ({
    asset_id,
    amount: parseFloat(payload) * GROTHS_IN_BEAM,
    fee: FEE_DEFAULT,
    is_push_transaction: false,
  }),
  target: calculateChangeFx,
});
