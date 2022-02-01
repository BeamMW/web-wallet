import { createAsyncAction, createAction } from 'typesafe-actions';
import { ErrorMessage } from '@core/WasmWallet';
import { SyncProgress, DatabaseSyncProgress, SyncStep } from '@app/containers/Auth/interfaces';
import React from 'react';
import { AuthActionTypes } from './constants';

export const startWallet = createAsyncAction(
  AuthActionTypes.START_WALLET,
  AuthActionTypes.START_WALLET_SUCCESS,
  AuthActionTypes.START_WALLET_FAILURE,
)<string, string, ErrorMessage>();

export const setSyncedWalletState = createAction(AuthActionTypes.SET_SYNCED_WALLET_STATE)<boolean>();

export const setDefaultSyncState = createAction(AuthActionTypes.SET_DEFAULT_SYNC_STATE)();

export const updateWalletSyncProgress = createAction(AuthActionTypes.UPDATE_WALLET_SYNC_PROGRESS)<SyncProgress>();

export const downloadDatabaseFile = createAction(AuthActionTypes.DOWNLOAD_DATABASE_FILE)<DatabaseSyncProgress>();

export const restoreWallet = createAction(AuthActionTypes.RESTORE_WALLET)<DatabaseSyncProgress>();

export const setSyncStep = createAction(AuthActionTypes.SET_SYNC_STEP)<SyncStep>();

export const resetRestoreState = createAction(AuthActionTypes.RESET_RESTORE_STATE)();

export const updateSeedList = createAsyncAction(
  AuthActionTypes.UPDATE_SEED_LIST,
  AuthActionTypes.UPDATE_SEED_LIST_SUCCESS,
  AuthActionTypes.UPDATE_SEED_LIST_FAILURE,
)<React.ChangeEvent<HTMLInputElement>, { index: number; value: string; valid: boolean }, ErrorMessage>();

export const checkIsAllowedSeed = createAsyncAction(
  AuthActionTypes.CHECK_IS_ALLOWED_SEED,
  AuthActionTypes.CHECK_IS_ALLOWED_SEED_SUCCESS,
  AuthActionTypes.CHECK_IS_ALLOWED_SEED_FAILURE,
)<string[], { values: string[]; valid: boolean[] }, ErrorMessage>();

export const setSeedResult = createAction(AuthActionTypes.SET_SEED_RESULT)<null | string>();

export const generateRegistrationSeed = createAsyncAction(
  AuthActionTypes.GENERATE_REGISTRATION_SEED,
  AuthActionTypes.GENERATE_REGISTRATION_SEED_SUCCESS,
  AuthActionTypes.GENERATE_REGISTRATION_SEED_FAILURE,
)<void, { registration_seed: string; seed_ids: number[] }, ErrorMessage>();

export const setRegistrationSeed = createAction(AuthActionTypes.SET_REGISTRATION_SEED)<{
  registration_seed: string;
  is_restore: boolean;
}>();
