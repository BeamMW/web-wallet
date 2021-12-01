import { createAction } from 'typesafe-actions';
import { WalletTotal, Asset, Transaction } from '@core/types';
import { WalletActionTypes } from './constants';

export const setTotals = createAction(WalletActionTypes.SET_TOTALS)<WalletTotal[]>();
export const setAssets = createAction(WalletActionTypes.SET_ASSETS)<Asset[]>();
export const setTransactions = createAction(WalletActionTypes.SET_TRANSACTIONS)<Transaction[]>();
