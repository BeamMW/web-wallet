import { createAsyncAction } from 'typesafe-actions';
import { ErrorMessage } from '@core/WasmWallet';
import { VersionInterface } from '@app/containers/Settings/interfaces';
import { SettingsActionTypes } from './constants';

export const deleteWallet = createAsyncAction(
  SettingsActionTypes.DELETE_WALLET,
  SettingsActionTypes.DELETE_WALLET_SUCCESS,
  SettingsActionTypes.DELETE_WALLET_FAILURE,
)<string, string, ErrorMessage>();

export const loadLogs = createAsyncAction(
  SettingsActionTypes.LOAD_LOGS,
  SettingsActionTypes.LOAD_LOGS_SUCCESS,
  SettingsActionTypes.LOAD_LOGS_FAILURE,
)<void, string, ErrorMessage>();

export const loadVersion = createAsyncAction(
  SettingsActionTypes.GET_VERSION,
  SettingsActionTypes.GET_VERSION_SUCCESS,
  SettingsActionTypes.GET_VERSION_FAILURE,
)<void, VersionInterface, ErrorMessage>();
