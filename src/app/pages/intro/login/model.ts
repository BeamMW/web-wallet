import {
  createEffect, createEvent, createStore, restore,
} from 'effector';

import { $onboarding } from '@model/base';
import { isNil } from '@core/utils';
import WasmWallet, { ErrorMessage } from '@core/WasmWallet';
import { setView, View } from '@app/model/view';
import WalletController from '@app/core/WalletController';

export enum LoginPhase {
  LOADING,
  ACTIVE,
  RESTORE,
  FIRSTTIME,
}

export const setLoginPhase = createEvent<LoginPhase>();

export const $phase = restore(setLoginPhase, LoginPhase.LOADING);

export const checkPasswordFx = createEffect<string, string, ErrorMessage>(
  WasmWallet.checkPassword,
);

export const $error = createStore<ErrorMessage>(null);

$error.on(checkPasswordFx.failData, (state, payload) => payload);
$error.reset(checkPasswordFx.done);

export const startWallet = createEvent<string>();

export const tryStartWallet = (pass: string) => {
  const unwatch = checkPasswordFx.doneData.watch(() => {
    unwatch();
    setView(View.PROGRESS);
    WalletController.start(pass);
  });

  checkPasswordFx(pass);
};

export const tryRemoveWallet = (pass: string) => {
  const unwatch = checkPasswordFx.doneData.watch(() => {
    unwatch();
    setView(View.LOGIN);
    WasmWallet.getInstance().stop();
    WasmWallet.removeWallet();
  });

  checkPasswordFx(pass);
};

const unwatch = $onboarding.watch((value) => {
  if (!isNil(value)) {
    unwatch();
    setLoginPhase(value ? LoginPhase.FIRSTTIME : LoginPhase.ACTIVE);
  }
});
