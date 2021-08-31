import React from 'react';
import {
  combine, createEffect, createEvent, forward, guard, restore, sample,
} from 'effector';
import { debounce } from 'patronum/debounce';

import { calculateChange, validateAddress } from '@core/api';
import { FEE_DEFAULT, GROTHS_IN_BEAM, sendWalletEvent } from '@app/state/shared';

import { Change, RPCMethod, Validation } from '@app/core/types';
import { WalletEvent } from '@app/core/WasmWallet';
import { $balance } from '../portfolio/model';

const getValue = ({ target }: React.ChangeEvent<HTMLInputElement>) => target.value;

// address

export const onAddressInput = createEvent<ChangeEvent>();
export const setAddress = onAddressInput.map(getValue);
export const setAddressType = createEvent<string>();
export const setAddressValid = createEvent<boolean>();

export const $address = restore(setAddress, '');
export const $addressType = restore(setAddressType, null);
export const $addressValid = restore(setAddressValid, true);

const setAddressDebounced = debounce({ source: setAddress, timeout: 200 });
const validateAddressFx = createEffect((address) => validateAddress(address));

// call ValidateAddress on setAddress w/ debounce
forward({
  from: setAddressDebounced,
  to: validateAddressFx,
});

// receive Validate data
guard({
  source: sendWalletEvent,
  filter: ({ id }) => id === RPCMethod.ValidateAddress,
})
  .watch(({ result }: WalletEvent<Validation>) => {
    setAddressType(result.type);
    setAddressValid(result.is_valid);
  });

// asset

export const setSelected = createEvent<number>();

export const $selected = restore(setSelected, 0);
export const $asset = combine($balance, $selected, (array, index) => array[index]);

// amount

interface ChangeEvent extends React.ChangeEvent<HTMLInputElement> {}

export const onAmountInput = createEvent<ChangeEvent>();

const REG_AMOUNT = /^(\d+\.?)?(\d+)?$/;

const setAmount = createEvent<string>();

// should be a valid number
const setAmountSafe = onAmountInput
  .map(getValue)
  .filter({
    fn: (value) => REG_AMOUNT.test(value),
  });

// should not be higher than available amount
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

export const $amount = restore(setAmount, '');

const setAmountDebounced = debounce({ source: setAmount, timeout: 200 });
const calculateChangeFx = createEffect((params) => calculateChange(params));

// call CalculateChange on setAmount w/ debounce
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

// receive Change data
const setFee = guard({
  source: sendWalletEvent,
  filter: ({ id }) => id === RPCMethod.CalculateChange,
})
  .map(({ result }: WalletEvent<Change>) => result.explicit_fee);

export const $fee = restore(setFee, 0);

// misc

export const $options = $balance.map((state) => (
  state.map(({ name }) => name)
));
