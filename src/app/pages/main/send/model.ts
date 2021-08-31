import { $balance } from '@state/portfolio';
import {
  combine, createEvent, restore, sample,
} from 'effector';
import { debounce } from 'patronum/debounce';

import { calculateChange } from '@core/api';
import { FEE_DEFAULT, GROTHS_IN_BEAM } from '@app/state/shared';
import React from 'react';

export const setSelected = createEvent<number>();

export const $selected = restore(setSelected, 0);

export const $options = $balance.map((state) => (
  state.map(({ name }) => name)
));

export const $asset = combine($balance, $selected, (array, index) => array[index]);

interface ChangeEvent extends React.ChangeEvent<HTMLInputElement> {}

export const onAmountInput = createEvent<ChangeEvent>();

const setAmountSafe = onAmountInput.map(({ target }) => target.value);
const setAmount = createEvent<string>();

const REG_AMOUNT = /^(\d+\.?)?(\d+)?$/;

sample({
  source: $asset,
  clock: setAmountSafe,
  fn: ({ available }, value) => {
    if (!REG_AMOUNT.test(value)) {
      return;
    }

    const total = available / GROTHS_IN_BEAM;

    setAmount(
      parseFloat(value) > total
        ? total.toString() : value,
    );
  },
});

export const $amount = restore(setAmount, '');

const setAmountDebounced = debounce({ source: setAmount, timeout: 200 });

sample({
  source: $asset,
  clock: setAmountDebounced,
  fn: ({ asset_id }, payload) => {
    const amount = parseFloat(payload) * GROTHS_IN_BEAM;
    calculateChange({
      amount,
      asset_id,
      fee: FEE_DEFAULT,
      is_push_transaction: false,
    });
  },
});
