import React from 'react';
import {
  combine, createEffect, createEvent, createStore, restore, sample, Store,
} from 'effector';
import { debounce } from 'patronum/debounce';
import { spread } from 'patronum/spread';

import {
  gotoWallet, gotoConfirm,
} from '@app/model/view';

import {
  AMOUNT_MAX, FEE_DEFAULT, GROTHS_IN_BEAM,
} from '@app/model/rates';

import { TransactionType, WalletTotal } from '@app/core/types';
import {
  getInputValue, isNil, makePrevented,
} from '@app/core/utils';

import {
  calculateChange,
  sendTransaction,
  validateAddress,
  SendTransactionParams,
} from '@app/core/api';

import { $assets, $totals } from '../wallet/model';

/* Misc */

type ReactChangeEvent = React.ChangeEvent<HTMLInputElement>;

export const $options = combine($totals, $assets, (totals, assets) => (
  totals.map(({ asset_id }) => assets[asset_id].metadata_pairs.N)
));

/* Send Address */

export const onFormSubmit = makePrevented(gotoConfirm);
export const onConfirmSubmit = makePrevented(gotoWallet);

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

/* Asset Select */

const ASSET_BLANK: WalletTotal = {
  asset_id: 0,
  available: 0,
  available_str: '0',
  maturing: 0,
  maturing_str: '0',
  receiving: 0,
  receiving_str: '0',
  sending: 0,
  sending_str: '0',
};

export const setSelected = createEvent<number>();

export const $selected = restore(setSelected, 0);

export const $totalSelected = combine($totals, $selected,
  (array, index) => (array.length > 0 ? array[index] : ASSET_BLANK));

/* Amount Field */

const calculateChangeFx = createEffect(calculateChange);

const REG_AMOUNT = /^(?:[1-9]\d*|0)?(?:\.(\d+)?)?$/;

export const onAmountInput = createEvent<ReactChangeEvent>();

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

export const $fee = createStore(FEE_DEFAULT);
export const $change = createStore(0);

export const $amount = restore(setAmount, '');
export const $amountGroths = $amount.map((value) => parseFloat(value) * GROTHS_IN_BEAM);
export const $amountError = combine($totalSelected, $amountGroths, $fee,
  ({ available }, amount, fee) => {
    const total = amount + fee;
    return total > available
      ? `Insufficient funds: you would need ${total / GROTHS_IN_BEAM} BEAM to complete the transaction` : null;
  });

const setAddressDebounced = debounce({ source: setAddress, timeout: 200 });
const validateAddressFx = createEffect(validateAddress);

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

const $params: Store<SendTransactionParams> = combine(
  $amountGroths,
  $fee,
  $address,
  $totalSelected,
  (value, fee, address, { asset_id }) => ({
    value,
    fee,
    address,
    asset_id,
  }),
);

// reset address when user leaves Send
$address.reset(gotoWallet);

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

// call CalculateChange on setAmount w/ debounce
sample({
  source: $totalSelected,
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
spread({
  source: calculateChangeFx.doneData,
  targets: {
    explicit_fee: $fee,
    asset_change: $change,
  },
});

// call SendTransaction on submit
sample({
  source: $params,
  clock: onConfirmSubmit,
  target: [sendTransactionFx],
});
