import React from 'react';

import {
  sample,
  restore,
  createEffect,
  createEvent,
} from 'effector';

import { createAddress } from '@app/core/api';
import { compact, preventEvent } from '@app/core/utils';
import { gotoWallet } from '@app/model/view';

const copyToClipboard = (value: string) => navigator.clipboard.writeText(value);

export const onInputChange = createEvent<[string, number]>();

const setAmount = onInputChange.map(([value]) => value);
const setAsset = onInputChange.map(([,value]) => value);

export const getAddressFx = createEffect(createAddress);

export const $address = restore(getAddressFx.doneData, '');
export const $addressPreview = $address.map(compact);

export const $amount = restore(setAmount, '');
export const $asset = restore(setAsset, 0);

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
