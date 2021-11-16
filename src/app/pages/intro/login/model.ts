import {
  createEffect, createEvent, createStore, restore,
} from 'effector';

import { $onboarding } from '@model/base';
import { isNil } from '@core/utils';
import { ErrorMessage } from '@core/WasmWallet';
import { startWallet } from '@app/core/api';


import {ROUTES} from "@app/shared/constants";
import {default as store} from "../../../../index";
import {navigate} from "@app/shared/store/actions";

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

startWalletFx.done.watch(() =>    store.dispatch(navigate((ROUTES.AUTH.PROGRESS)) ));

const unwatch = $onboarding.watch((value) => {
  if (!isNil(value)) {
    unwatch();
    //todo check
    store.dispatch(navigate(value ? ROUTES.AUTH.RESTORE : ROUTES.AUTH.LOGIN))

  //  setLoginPhase(value ? LoginPhase.FIRSTTIME : LoginPhase.ACTIVE);
  }
});
