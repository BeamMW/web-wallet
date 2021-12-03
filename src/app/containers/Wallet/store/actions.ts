import { createAction, createAsyncAction } from 'typesafe-actions';
import {
  WalletTotal, Asset, Transaction, CreateAddressParams,
} from '@core/types';
import { ErrorMessage } from '@core/WasmWallet';
import { WalletActionTypes } from './constants';
import { ReceiveAmount } from '../interfaces';

export const setTotals = createAction(WalletActionTypes.SET_TOTALS)<WalletTotal[]>();
export const setAssets = createAction(WalletActionTypes.SET_ASSETS)<Asset[]>();
export const setTransactions = createAction(WalletActionTypes.SET_TRANSACTIONS)<Transaction[]>();

export const loadRate = createAsyncAction(
  WalletActionTypes.GET_RATE,
  WalletActionTypes.GET_RATE_SUCCESS,
  WalletActionTypes.GET_RATE_FAILURE,
)<void, number, ErrorMessage>();

export const setReceiveAmount = createAction(WalletActionTypes.SET_RECEIVE_AMOUNT)<ReceiveAmount>();

export const generateAddress = createAsyncAction(
  WalletActionTypes.GENERATE_ADDRESS,
  WalletActionTypes.GENERATE_ADDRESS_SUCCESS,
  WalletActionTypes.GENERATE_ADDRESS_FAILURE,
)<CreateAddressParams, string, ErrorMessage>();

export const resetReceive = createAction(WalletActionTypes.RESET_RECEIVE)();
