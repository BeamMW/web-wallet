import { createAsyncAction, createAction } from 'typesafe-actions';
import { ErrorMessage } from '@core/WasmWallet';
import { SyncProgress } from '@app/containers/Auth/interfaces';
import { AuthActionTypes } from './constants';

export const startWallet = createAsyncAction(
  AuthActionTypes.START_WALLET,
  AuthActionTypes.START_WALLET_SUCCESS,
  AuthActionTypes.START_WALLET_FAILURE,
)<string, string, ErrorMessage>();

export const setSyncedWalletState = createAction(AuthActionTypes.SET_SYNCED_WALLET_STATE)<boolean>();

export const updateWalletSyncProgress = createAction(AuthActionTypes.UPDATE_WALLET_SYNC_PROGRESS)<SyncProgress>();
