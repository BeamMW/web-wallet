import { createAction, createAsyncAction } from 'typesafe-actions';
import { WalletTotal, Asset, Transaction } from '@core/types';
import { ErrorMessage } from '@core/WasmWallet';
import { WalletActionTypes } from './constants';

export const setTotals = createAction(WalletActionTypes.SET_TOTALS)<WalletTotal[]>();
export const setAssets = createAction(WalletActionTypes.SET_ASSETS)<Asset[]>();
export const setTransactions = createAction(WalletActionTypes.SET_TRANSACTIONS)<Transaction[]>();

export const loadRate = createAsyncAction(
  WalletActionTypes.GET_RATE,
  WalletActionTypes.GET_RATE_SUCCESS,
  WalletActionTypes.GET_RATE_FAILURE,
)<void, number, ErrorMessage>();
