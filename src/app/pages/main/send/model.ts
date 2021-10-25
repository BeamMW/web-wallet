import React from 'react';
import {
  combine, createEffect, createEvent, createStore, guard, restore, sample, Store,
} from 'effector';
import { debounce } from 'patronum/debounce';

import {
  gotoWallet, gotoConfirm, gotoSend,
} from '@app/model/view';

import { FEE_DEFAULT } from '@app/model/rates';

import {
  isNil,
  toGroths,
  fromGroths,
  getInputValue,
  makePrevented,
  truncate,
} from '@app/core/utils';

import {
  calculateChange,
  sendTransaction,
  validateAddress,
} from '@app/core/api';

import { $assets, AssetTotal } from '@app/model/wallet';

/* Constants */

type Amount = [string, number];
type Change = [number, number];

const ASSET_BLANK: AssetTotal = {
  asset_id: 0,
  available: 0,
  available_str: '0',
  maturing: 0,
  maturing_str: '0',
  receiving: 0,
  receiving_str: '0',
  sending: 0,
  sending_str: '0',
  metadata_pairs: {
    N: '',
    SN: '',
    UN: '',
  },
};

/* Effects */

const validateAddressFx = createEffect(validateAddress);
const calculateChangeFx = createEffect(calculateChange);
const sendTransactionFx = createEffect(sendTransaction);

/* Form */

export const setMaxAmount = createEvent<React.MouseEvent>();

export const onFormSubmit = makePrevented(gotoConfirm);
export const onConfirmSubmit = makePrevented(gotoWallet);

export const onAddressChange = createEvent<ReactChangeEvent>();
export const onCommentChange = createEvent<ReactChangeEvent>();

export const setAddress = onAddressChange.map(getInputValue);
export const setComment = onCommentChange.map(getInputValue);

export const setOffline = createEvent<boolean>();
export const setAmount = createEvent<Amount>();
export const setChange = createEvent<Change>();

export const $address = restore(setAddress, '');
export const $offline = restore(setOffline, false);
export const $amount = restore<Amount>(setAmount, ['', 0]);
export const $comment = restore(setComment, '');
export const $change = restore(setChange, [FEE_DEFAULT, 0]);

export const $addressData = restore(validateAddressFx.doneData, {
  type: null,
  amount: null,
  is_mine: null,
  is_valid: null,
  asset_id: null,
  payments: null,
});

export const $form = combine(
  $addressData,
  $change,
  $amount,
  $address,
  $offline,
  $comment,
  (
    { type },
    [fee], [amount, asset_id],
    address, offline, comment,
  ) => {
    const isMaxPrivacy = type === 'max_privacy';
    const value = amount === '' ? 0 : toGroths(parseFloat(amount));

    return {
      fee,
      value,
      address,
      comment,
      asset_id,
      offline: offline || isMaxPrivacy,
    };
  },
);

export const $ready = createStore(false);

export const $selected = combine($assets, $form,
  (assets, { asset_id }) => assets.find(({ asset_id: id }) => id === asset_id) ?? ASSET_BLANK);

const $beam = $assets.map(([asset]) => asset);

$ready.reset(setAmount, onAddressChange);
$ready.on(validateAddressFx.done, () => true);
$ready.on(calculateChangeFx.done, () => true);

const onMaxPrivacy = guard({
  source: validateAddressFx.doneData,
  filter: ({ type: addressType }) => addressType === 'max_privacy',
});

$addressData.reset(setAddress);

/* Validate Address */

const setAddressDebounced = debounce({
  source: setAddress,
  timeout: 200,
});

// call ValidateAddress on setAddress w/ debounce
guard({
  source: setAddressDebounced,
  filter: (value) => value !== '',
  target: validateAddressFx,
});

/* Validate Amount */

const setAmountDebounced = debounce({
  source: setAmount,
  timeout: 200,
});

const $changeParams = $form.map(({
  value: amount,
  asset_id,
  offline: is_push_transaction,
}) => ({
  amount,
  asset_id,
  is_push_transaction,
}));

// call CalculateChange on amount (should be positive) change w/ debounce
const requestChange = sample({
  source: $changeParams,
  clock: [setAmountDebounced, onMaxPrivacy, $offline],
});

guard({
  source: requestChange,
  filter: ({ amount }) => amount > 0,
  target: calculateChangeFx,
});

// update fee & change
$change.on(calculateChangeFx.doneData, (state, { explicit_fee: fee, change }) => [fee, change]);

// set max amount
sample({
  source: combine($selected, $form),
  clock: setMaxAmount,
  fn: ([{ available }, { asset_id, fee }]) => {
    const total = asset_id === 0
      ? Math.max(available - fee, 0) : available;
    const amount = fromGroths(total).toString();
    return [amount, asset_id] as Amount;
  },
  target: setAmount,
});

const onAmountFromToken = validateAddressFx.doneData.filter({
  fn: ({ amount }) => !isNil(amount),
});

// update amount and asset id
sample({
  source: $form,
  clock: onAmountFromToken,
  fn: ({ asset_id: previous }, { amount, asset_id }) => [
    amount.toString(),
    isNil(asset_id) ? previous : asset_id,
  ] as Amount,
  target: setAmount,
});

// call SendTransaction on submit
sample({
  source: $form,
  clock: onConfirmSubmit,
  target: sendTransactionFx,
});

/* Misc */

type ReactChangeEvent = React.ChangeEvent<HTMLInputElement>;

/* Send Address */

enum AddressLabel {
  ERROR = 'Invalid wallet address',
  MAX_PRIVACY = 'Guarantees maximum anonymity set of up to 64K.',
  OFFLINE = 'Offline address.',
  REGULAR = 'Regular address',
}

enum AddresssTip {
  MAX_PRIVACY = 'Transaction can last at most 72 hours.',
  OFFLINE = 'Make sure the address is correct as offline transactions cannot be canceled.',
  REGULAR = 'The recipient must get online within the next 12 hours and you should get online within 2 hours afterwards.',
}

export const $description: Store<[string, string]> = combine(
  $form,
  $addressData,
  ({
    address,
    offline,
  }, {
    is_valid,
    payments,
    type: addressType,
  }) => {
    if (address === '' || isNil(addressType)) {
      return [null, null];
    }

    if (!is_valid || addressType === 'unknown') {
      return [AddressLabel.ERROR, null];
    }

    if (addressType === 'max_privacy') {
      return [AddressLabel.MAX_PRIVACY, AddresssTip.MAX_PRIVACY];
    }

    if (offline) {
      const warning = payments === 1
        ? 'transactions left.'
        : 'transaction left. Ask receiver to come online to support more offline transaction.';

      const label = `${AddressLabel.OFFLINE} ${payments} ${warning}`;

      return [label, AddresssTip.OFFLINE];
    }

    return [AddressLabel.REGULAR, AddresssTip.REGULAR];
  },
);

/* Amount Field */

const STORES = [
  $address,
  $amount,
  $offline,
  $change,
  $comment,
  $addressData,
  $ready,
];

STORES.forEach((store) => store.reset(gotoSend));

enum AmountError {
  FEE = 'Insufficient funds to pay transaction fee.',
  AMOUNT = 'Insufficient funds to complete the transaction. Maximum amount is ',
}

export const $amountError = combine(
  $beam, $form, $selected,
  (
    beam,
    { fee, value },
    { available, metadata_pairs },
  ) => {
    if (value === 0 || isNil(beam)) {
      return null;
    }

    const total = value + fee;

    if (beam.available < fee) {
      return AmountError.FEE;
    }

    if (total > available) {
      const max = fromGroths(available - fee);
      return `${AmountError.AMOUNT} ${max} ${truncate(metadata_pairs.UN)}`;
    }

    return null;
  },
);

export const $valid = combine(
  validateAddressFx.pending,
  $ready,
  $form,
  $addressData,
  $amountError,
  (pending, ready, { value, offline }, { is_valid, payments }, amountError) => {
    if (offline && payments === 0) {
      return false;
    }

    return !pending && ready && is_valid && value > 0 && isNil(amountError);
  },
);
