import {
  createEffect, createStore, restore,
} from 'effector';

import { ErrorMessage } from '@core/WasmWallet';
import { deleteWallet, getVersion, loadBackgroundLogs } from '@app/core/api';
import { setView, View } from '@app/model/view';
import { LoginPhase, setLoginPhase } from '@app/pages/intro/login/model';

export const deleteWalletFx = createEffect<string, string, ErrorMessage>(deleteWallet);

export const $error = createStore<ErrorMessage>(null);

export const getVersionFx = createEffect(async () => {
  return await getVersion();
});

export const $version = restore(
  getVersionFx.doneData.map((data) => {
    return data;
  }), {
    beam_branch_name: '', beam_version: '',
  },
);

export const loadLogsFx = createEffect(loadBackgroundLogs);

export const $logs = restore(loadLogsFx.doneData, '');

$error.on(deleteWalletFx.failData, (state, payload) => payload);
$error.reset(deleteWalletFx.done);

deleteWalletFx.done.watch(() => {
  setLoginPhase(LoginPhase.FIRSTTIME);
  setView(View.LOGIN);
});
