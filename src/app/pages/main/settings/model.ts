import {
  createEffect, createStore,
} from 'effector';

import { ErrorMessage } from '@core/WasmWallet';
import { deleteWallet } from '@app/core/api';

export const deleteWalletFx = createEffect<string, string, ErrorMessage>(deleteWallet);

export const $error = createStore<ErrorMessage>(null);

$error.on(deleteWalletFx.failData, (state, payload) => payload);
$error.reset(deleteWalletFx.done);
