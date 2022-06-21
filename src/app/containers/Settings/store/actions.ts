import { createAsyncAction } from 'typesafe-actions';
import { ErrorMessage } from '@core/WasmWallet';
import { VersionInterface, connectedSiteInterface } from '@app/containers/Settings/interfaces';
import { ExternalAppConnection } from '@core/types';
import { SettingsActionTypes } from './constants';

export const deleteWallet = createAsyncAction(
  SettingsActionTypes.DELETE_WALLET,
  SettingsActionTypes.DELETE_WALLET_SUCCESS,
  SettingsActionTypes.DELETE_WALLET_FAILURE,
)<string, void, ErrorMessage>();

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

export const loadConnectedSites = createAsyncAction(
  SettingsActionTypes.LOAD_CONNECTED_SITES,
  SettingsActionTypes.LOAD_CONNECTED_SITES_SUCCESS,
  SettingsActionTypes.LOAD_CONNECTED_SITES_FAILURE,
)<void, connectedSiteInterface[], ErrorMessage>();

export const disconnectAllowedSite = createAsyncAction(
  SettingsActionTypes.DISCONNECT_SITE,
  SettingsActionTypes.DISCONNECT_SITE_SUCCESS,
  SettingsActionTypes.DISCONNECT_SITE_FAILURE,
)<ExternalAppConnection, void, ErrorMessage>();
