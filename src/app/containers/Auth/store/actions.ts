import { createAsyncAction } from 'typesafe-actions';
import { ErrorMessage } from '@core/WasmWallet';
import { AuthActionTypes } from './constants';

export const startWallet = createAsyncAction(
  AuthActionTypes.START_WALLET,
  AuthActionTypes.START_WALLET_SUCCESS,
  AuthActionTypes.START_WALLET_FAILURE,
)<string, string, ErrorMessage>();
