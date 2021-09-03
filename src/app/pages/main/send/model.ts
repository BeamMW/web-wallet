import React from 'react';
import {
  combine, createEffect, createEvent, createStore, restore, sample, Store,
} from 'effector';
import { debounce } from 'patronum/debounce';
import { spread } from 'patronum/spread';

import {
  AMOUNT_MAX, FEE_DEFAULT, GROTHS_IN_BEAM, setView, View,
} from '@app/model';
import { TransactionType } from '@app/core/types';
import {
  curry, getInputValue, isNil, makeOnClick, makeOnSubmit,
} from '@app/core/utils';
import {
  calculateChange, sendTransaction, SendTransactionParams, validateAddress,
} from '@app/core/api';
import { $balance, Balance } from '../portfolio/model';

/* Misc */

export const $options = $balance.map((state) => (
  state.map(({ name }) => name)
));

/* Routes */

export const gotoPortfolio = makeOnClick(
  curry(setView, View.SEND_FORM),
);

export const gotoForm = makeOnClick(
  curry(setView, View.SEND_FORM),
);

export const gotoConfirm = makeOnSubmit(
  curry(setView, View.SEND_CONFIRM),
);

/* Adress Field */

type ReactChangeEvent = React.ChangeEvent<HTMLInputElement>;

export const onAddressInput = createEvent<ReactChangeEvent>();
export const setAddress = onAddressInput.map(getInputValue);
export const setAddressType = createEvent<TransactionType>();
export const setAddressValid = createEvent<boolean>();

export const $address = restore(setAddress, '');
export const $addressType = restore(setAddressType, null);
export const $addressValid = restore(setAddressValid, true);

export const $addressLabel = combine($addressValid, $addressType, (valid, addressType) => {
  switch (true) {
    case isNil(addressType):
      return null;
    case !valid:
      return 'Invalid wallet address';
    default:
      return `${TransactionType[addressType]} address.`;
  }
});

const setAddressDebounced = debounce({ source: setAddress, timeout: 200 });
const validateAddressFx = createEffect(validateAddress);

// call ValidateAddress on setAddress w/ debounce
setAddressDebounced.watch(validateAddressFx);

// receive Validate data
spread({
  source: validateAddressFx.doneData,
  targets: {
    type: $addressType,
    is_valid: $addressValid,
  },
});

/* Asset Select */

const ASSET_BLANK: Balance = {
  name: '',
  short: '',
  asset_id: 0,
  available: 0,
  maturing: 0,
  receiving: 0,
  sending: 0,
};

export const setSelected = createEvent<number>();

export const $selected = restore(setSelected, 0);
export const $asset = combine($balance, $selected,
  (array, index) => (array.length > 0 ? array[index] : ASSET_BLANK));

/* Amount Field */

const calculateChangeFx = createEffect(calculateChange);

export const onAmountInput = createEvent<ReactChangeEvent>();

const REG_AMOUNT = /^(?:[1-9]\d*|0)?(?:\.(\d+)?)?$/;

const setAmount = onAmountInput
  .map(getInputValue)
  // should be a valid number
  .filter({
    fn: (value) => REG_AMOUNT.test(value),
  })
  // cap at max amount
  .map((value) => {
    if (value === '0') {
      return '';
    }

    return parseFloat(value) > AMOUNT_MAX
      ? AMOUNT_MAX.toString() : value;
  });

const setAmountPositive = setAmount.filter({
  fn: (value) => parseFloat(value) > 0,
});

const setAmountDebounced = debounce({
  source: setAmountPositive,
  timeout: 200,
});

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
})
  .watch(calculateChangeFx);

// receive Change data
export const $fee = createStore(FEE_DEFAULT);
export const $change = createStore(0);

spread({
  source: calculateChangeFx.doneData,
  targets: {
    explicit_fee: $fee,
    asset_change: $change,
  },
});

export const $amount = restore(setAmount, '');
export const $amountGroths = $amount.map((value) => parseFloat(value) * GROTHS_IN_BEAM);
export const $amountError = combine($asset, $amountGroths, $fee, ({ available }, amount, fee) => {
  const total = amount + fee;
  return total > available
    ? `Insufficient funds: you would need ${total / GROTHS_IN_BEAM} BEAM to complete the transaction` : null;
});

export const $valid = combine(
  $address,
  validateAddressFx.pending,
  $addressValid,
  $amount,
  $amountError,
  (address, pending, addressValid, amount, amountError) => (
    address !== '' && !pending && addressValid && amount !== '' && isNil(amountError)
  ),
);

const sendTransactionFx = createEffect(sendTransaction);

export const onConfirmSubmit = makeOnSubmit(() => {
  setView(View.PORTFOLIO);
});

const $params: Store<SendTransactionParams> = combine(
  $amountGroths,
  $fee,
  $address,
  $asset,
  (value, fee, address, { asset_id }) => ({
    value,
    fee,
    address,
    asset_id,
  }),
);

// call SendTransaction on submit
sample({
  source: $params,
  clock: onConfirmSubmit,
  target: sendTransactionFx,
});
