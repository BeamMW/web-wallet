import React from 'react';
import {
  combine, createEffect, createEvent, createStore, guard, sample, Store,
} from 'effector';
import { debounce } from 'patronum/debounce';

import {
  gotoWallet, gotoConfirm, gotoSend,
} from '@app/model/view';

import { FEE_DEFAULT } from '@app/model/rates';

import { AddressValidation } from '@app/core/types';

import {
  isNil,
  toGroths,
  fromGroths,
  getInputValue,
  makePrevented,
} from '@app/core/utils';

import {
  calculateChange,
  sendTransaction,
  validateAddress,
} from '@app/core/api';

import { $assets, AssetTotal } from '@app/model/wallet';

/* Constants */

type Amount = [string, number];

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

interface SendForm {
  fee: number;
  value: number;
  change: number;
  amount: string;
  address: string;
  offline: boolean;
  asset_id: number;
  comment: '',
}

export const onAmountChange = createEvent<Amount>();
export const onAddressChange = createEvent<ReactChangeEvent>();

export const setOffline = createEvent<boolean>();
export const setMaxAmount = createEvent<React.MouseEvent>();
export const setAddress = onAddressChange.map(getInputValue);

export const onFormSubmit = makePrevented(gotoConfirm);
export const onConfirmSubmit = makePrevented(gotoWallet);

export const $form = createStore<SendForm>({
  fee: FEE_DEFAULT,
  value: 0,
  change: 0,
  amount: '',
  address: '',
  offline: false,
  asset_id: 0,
  comment: '',
});

export const $address = createStore<AddressValidation>({
  type: null,
  amount: null,
  is_mine: null,
  is_valid: null,
  asset_id: null,
  payments: null,
});

export const $ready = createStore(false);

export const $selected = combine($assets, $form,
  (assets, { asset_id }) => assets.find(({ asset_id: id }) => id === asset_id) ?? ASSET_BLANK);

const $beam = $assets.map(([asset]) => asset);

$ready.reset(onAmountChange, onAddressChange);
$ready.on(validateAddressFx.done, () => true);
$ready.on(calculateChangeFx.done, () => true);

$form.on(setOffline, (state, offline) => ({
  ...state,
  offline,
}));

$form.on(onAmountChange, (state, [amount, asset_id]) => {
  if (state.amount === amount && state.asset_id === asset_id) {
    return state;
  }

  return {
    ...state,
    value: toGroths(parseFloat(amount)),
    amount,
    asset_id,
  };
});

$form.on(setAddress, (state, address) => ({
  ...state,
  address,
}));

$address.on(validateAddressFx.doneData, (state, payload) => payload);

$address.reset(setAddress);

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

const onAmountChangeDebounced = debounce({
  source: onAmountChange,
  timeout: 200,
});

const onAmountChangePositive = guard({
  source: $form,
  clock: onAmountChangeDebounced,
  filter: ({ value }) => value > 0,
});

// call CalculateChange on amount change w/ debounce
sample({
  clock: onAmountChangePositive,
  fn: ({
    fee,
    asset_id,
    value: amount,
    offline: is_push_transaction,
  }) => ({
    fee,
    amount,
    asset_id,
    is_push_transaction,
  }),
  target: calculateChangeFx,
});

// update fee & change
$form.on(calculateChangeFx.doneData, (state, { explicit_fee: fee, change }) => ({
  ...state,
  fee,
  change,
}));

// set max amount
sample({
  source: combine($selected, $form),
  clock: setMaxAmount,
  fn: ([{ available }, { asset_id, fee }]) => {
    const total = asset_id === 0 ? available - fee : available;
    const amount = fromGroths(total);
    return [amount.toString(), asset_id] as Amount;
  },
  target: onAmountChange,
});

const onAmountFromToken = validateAddressFx.doneData.filter({
  fn: ({ amount }) => !isNil(amount),
});

// update amount and asset id
sample({
  source: $form,
  clock: onAmountFromToken,
  fn: ({
    asset_id: previous,
  }, { amount, asset_id }) => [
    amount.toString(),
    isNil(asset_id) ? previous : asset_id,
  ] as Amount,
  target: onAmountChange,
});

// call SendTransaction on submit
sample({
  source: $form,
  clock: onConfirmSubmit,
  fn: ({ amount, ...payload }) => payload,
  target: sendTransactionFx,
});

/* Misc */

type ReactChangeEvent = React.ChangeEvent<HTMLInputElement>;

/* Send Address */

export const $description: Store<[string, string]> = combine(
  $form,
  $address,
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
      return ['Invalid wallet address', null];
    }

    if (addressType === 'max_privacy') {
      return [
        'Guarantees maximum anonymity set of up to 64K.',
        'Transaction can last at most 72 hours.',
      ];
    }

    if (offline) {
      const warning = payments === 1
        ? 'transaction left. Ask receiver to come online to support more offline transaction.'
        : 'transactions left.';

      return [
        `Offline address. ${payments} ${warning}`,
        'Make sure the address is correct as offline transactions cannot be canceled.',
      ];
    }

    return [
      'Regular address',
      'The recipient must get online within the next 12 hours and you should get online within 2 hours afterwards.',
    ];
  },
);

/* Amount Field */

const STORES = [
  $form,
  $address,
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
    { fee, amount, value },
    { asset_id, available, metadata_pairs },
  ) => {
    if (amount === '') {
      return null;
    }

    const total = value + fee;

    if (total > available) {
      const max = fromGroths(available - fee);
      return `${AmountError.AMOUNT} ${max} ${metadata_pairs.UN}`;
    }

    if (
      beam.available < fee || (asset_id === 0 && total > available)
    ) {
      return AmountError.FEE;
    }

    return null;
  },
);

export const $valid = combine(
  validateAddressFx.pending,
  $ready,
  $form,
  $address,
  $amountError,
  (pending, ready, { value }, { is_valid }, amountError) => (
    !pending && ready && is_valid && value > 0 && isNil(amountError)
  ),
);
