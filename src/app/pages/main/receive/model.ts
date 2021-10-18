import React from 'react';

import {
  sample,
  restore,
  createEffect,
  createEvent,
} from 'effector';

import { createAddress } from '@app/core/api';
import {
  compact, fromCheckbox, preventEvent,
} from '@app/core/utils';
import { gotoReceive, gotoWallet } from '@app/model/view';

type Amount = [string, number];

const copyToClipboard = (value: string) => navigator.clipboard.writeText(value);

export const setAmount = createEvent<Amount>();

export const onToggleChange = createEvent<React.ChangeEvent>();

const setMaxAnonymity = onToggleChange.map(fromCheckbox);

export const createAddressFx = createEffect(createAddress);

export const $address = restore(createAddressFx.doneData, '');
export const $addressPreview = $address.map(compact);

export const $amount = restore<Amount>(setAmount, ['', 0]);
export const $maxAnonymity = restore(setMaxAnonymity, false);

export const copyToClipboardFx = createEffect(copyToClipboard);

export const copyAddress = createEvent<React.SyntheticEvent>();

export const copyAndClose = createEvent<React.SyntheticEvent>().map(preventEvent);

sample({
  clock: copyAndClose,
  target: gotoWallet,
});

// copy address to clipboard on submit
sample({
  source: $address,
  clock: [copyAddress, copyAndClose],
  target: copyToClipboardFx,
});

const STORES = [
  $address,
  $amount,
  $maxAnonymity,
];

STORES.forEach((store) => store.reset(gotoReceive));
