import {
  createEffect, createEvent, createStore, restore, sample,
} from 'effector';

import { $onboarding } from '@model/base';
import { isNil } from '@core/utils';
import WasmWallet, { ErrorMessage } from '@core/WasmWallet';
import { setView, View } from '@app/model/view';

export enum LoginPhase {
  LOADING,
  ACTIVE,
  RESTORE,
  FIRSTTIME,
}

const wallet = WasmWallet.getInstance();

export const setLoginPhase = createEvent<LoginPhase>();

export const $phase = restore(setLoginPhase, LoginPhase.LOADING);

export const checkPasswordFx = createEffect<string, string, ErrorMessage>(
  WasmWallet.checkPassword,
);

export const $error = createStore<ErrorMessage>(null);

$error.on(checkPasswordFx.failData, (state, payload) => payload);
$error.reset(checkPasswordFx.done);

checkPasswordFx.doneData.watch((pass) => {
  setView(View.PROGRESS);
  wallet.start(pass);
});

const unwatch = $onboarding.watch((value) => {
  if (!isNil(value)) {
    unwatch();
    setLoginPhase(value ? LoginPhase.FIRSTTIME : LoginPhase.ACTIVE);
  }
});
