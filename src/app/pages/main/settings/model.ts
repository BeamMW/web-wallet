import {
  createEffect, createStore,
} from 'effector';

import { ErrorMessage } from '@core/WasmWallet';
import { deleteWallet } from '@app/core/api';
import { setView, View } from '@app/model/view';
import { LoginPhase, setLoginPhase } from '@app/pages/intro/login/model';

export const deleteWalletFx = createEffect<string, string, ErrorMessage>(deleteWallet);

export const $error = createStore<ErrorMessage>(null);

$error.on(deleteWalletFx.failData, (state, payload) => payload);
$error.reset(deleteWalletFx.done);

deleteWalletFx.done.watch(() => {
  setLoginPhase(LoginPhase.FIRSTTIME);
  setView(View.LOGIN);
});
