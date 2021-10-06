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
  FEE_DEFAULT, GROTHS_IN_BEAM,
} from '@app/model/rates';

import { AddressType } from '@app/core/types';
import {
  getInputValue, isNil, makePrevented,
} from '@app/core/utils';

import {
  calculateChange,
  sendTransaction,
  validateAddress,
  SendTransactionParams,
} from '@app/core/api';

import { $assets, AssetTotal } from '@app/model/wallet';

/* Misc */

type ReactChangeEvent = React.ChangeEvent<HTMLInputElement>;

/* Send Address */

export const onFormSubmit = makePrevented(gotoConfirm);
export const onConfirmSubmit = makePrevented(gotoWallet);

export const onAddressInput = createEvent<ReactChangeEvent>();
export const setAddress = onAddressInput.map(getInputValue);
export const setAddressValid = createEvent<boolean>();

export const $address = restore(setAddress, '');
export const $addressType = createStore<AddressType>(null);
export const $addressValid = restore(setAddressValid, true);
export const $payments = createStore<number>(null);

export const $addressLabel = combine(
  $address, $addressValid, $addressType,
  (address, valid, addressType) => {
    if (address === '') {
      return null;
    }

    if (!valid) {
      return 'Invalid wallet address';
    }

    switch (addressType) {
      case 'max_privacy':
        return 'Guarantees maximum anonymity set of up to 64K.';
      case 'offline':
      case 'public_offline':
        return 'Offline addresss';
      case 'regular':
      case 'regular_new':
        return 'Online address';
      default:
        return null;
    }
  },
);

/* Asset Select */

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
};

export const setOffline = createEvent<boolean>();

export const $offline = restore(setOffline, false);

/* Amount Field */

const calculateChangeFx = createEffect(calculateChange);

export const setAmount = createEvent<[string, number]>();

const setAmountPositive = setAmount.filter({
  fn: ([amount]) => parseFloat(amount) > 0,
});

const setAmountDebounced = debounce({
  source: setAmountPositive,
  timeout: 200,
});

export const $fee = createStore(FEE_DEFAULT);
export const $change = createStore(0);
export const $amount = restore<[string, number]>(setAmount, ['', 0]);

export const $selected = combine($assets, $amount,
  (array, [, index]) => array[index] ?? ASSET_BLANK);

enum AmountError {
  FEE = 'Insufficient funds to pay transaction fee.',
  AMOUNT = 'Insufficient funds to complete the transaction. Maximum amount is ',
}

export const $amountError = combine(
  $fee,
  $assets,
  $amount,
  (fee, assets, [value, index]) => {
    if (value === '') {
      return null;
    }

    const beam = assets[0];
    const target = assets[index];
    const { available } = target;
    const amount = parseInt(value, 10) * GROTHS_IN_BEAM;
    const groths = available / GROTHS_IN_BEAM;

    if (amount > available) {
      return `${AmountError.AMOUNT} ${groths} ${target.metadata_pairs.N}`;
    }

    if (
      beam.available < fee
      || (index === 0 && amount + fee > available)
    ) {
      return AmountError.FEE;
    }

    return null;
  },
);

const setAddressDebounced = debounce({ source: setAddress, timeout: 200 });
const validateAddressFx = createEffect(validateAddress);

validateAddressFx.doneData.watch((data) => console.log(data));

export const $valid = combine(
  $address,
  validateAddressFx.pending,
  $addressValid,
  $amount,
  $amountError,
  (address, pending, addressValid, [value], amountError) => (
    address !== '' && !pending && addressValid && value !== '' && isNil(amountError)
  ),
);

const sendTransactionFx = createEffect(sendTransaction);

const $params: Store<SendTransactionParams> = combine(
  $selected,
  $amount,
  $address,
  $offline,
  $fee,
  ({ asset_id }, [value], address, offline, fee) => ({
    value: parseInt(value, 10) / GROTHS_IN_BEAM,
    fee,
    address,
    asset_id,
    offline,
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

validateAddressFx.doneData.watch(
  ({ type }) => setOffline(type.includes('offline')),
);

// call CalculateChange on setAmount w/ debounce
sample({
  source: $selected,
  clock: setAmountDebounced,
  fn: ({ asset_id }, [amount]) => ({
    asset_id,
    amount: parseFloat(amount) * GROTHS_IN_BEAM,
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
