import {
  createEffect, createEvent, createStore, restore,
} from 'effector';

import { ErrorMessage } from '@core/WasmWallet';
import { startWallet } from '@core/api';

import { ROUTES } from '@app/shared/constants';
import { navigate } from '@app/shared/store/actions';
import store from '../../../../index';

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

startWalletFx.done.watch(() => store.dispatch(navigate(ROUTES.AUTH.PROGRESS)));
