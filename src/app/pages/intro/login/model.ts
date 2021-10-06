import {
  createEffect, createEvent, createStore, restore,
} from 'effector';

import { $onboarding } from '@model/base';
import { isNil } from '@core/utils';
import { ErrorMessage } from '@core/WasmWallet';
import { startWallet } from '@app/core/api';
import { setView, View } from '@app/model/view';

export enum LoginPhase {
  LOADING,
  ACTIVE,
  RESTORE,
  FIRSTTIME,
}

export const setLoginPhase = createEvent<LoginPhase>();

export const $phase = restore(setLoginPhase, LoginPhase.LOADING);

export const startWalletFx = createEffect<string, string, ErrorMessage>(startWallet);

export const $error = createStore<ErrorMessage>(null);

$error.on(startWalletFx.failData, (state, payload) => payload);
$error.reset(startWalletFx.done);

startWalletFx.done.watch(() => setView(View.PROGRESS));

const unwatch = $onboarding.watch((value) => {
  if (!isNil(value)) {
    unwatch();
    setLoginPhase(value ? LoginPhase.FIRSTTIME : LoginPhase.ACTIVE);
  }
});
