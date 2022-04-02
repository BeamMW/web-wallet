import { createAction, createAsyncAction } from 'typesafe-actions';
import {
  WalletTotal, Asset, CreateAddressParams, AddressData, ChangeData, SendTransactionParams,
} from '@core/types';
import { ErrorMessage } from '@core/WasmWallet';
import { CalculateChangeParams } from '@core/api';
import { WalletActionTypes } from './constants';
import { TransactionAmount, WalletStateType } from '../interfaces';

export const setTotals = createAction(WalletActionTypes.SET_TOTALS)<WalletTotal[]>();
export const setAssets = createAction(WalletActionTypes.SET_ASSETS)<Asset[]>();

export const resetSendData = createAction(WalletActionTypes.RESET_SEND_DATA)();
export const setSendTransactionState = createAction(WalletActionTypes.SET_SEND_TRANSACTION_STATE)<boolean>();

export const loadRate = createAsyncAction(
  WalletActionTypes.GET_RATE,
  WalletActionTypes.GET_RATE_SUCCESS,
  WalletActionTypes.GET_RATE_FAILURE,
)<void, number, ErrorMessage>();

export const setReceiveAmount = createAction(WalletActionTypes.SET_RECEIVE_AMOUNT)<TransactionAmount>();

export const generateAddress = createAsyncAction(
  WalletActionTypes.GENERATE_ADDRESS,
  WalletActionTypes.GENERATE_ADDRESS_SUCCESS,
  WalletActionTypes.GENERATE_ADDRESS_FAILURE,
)<CreateAddressParams, string, ErrorMessage>();

export const resetReceive = createAction(WalletActionTypes.RESET_RECEIVE)();

export const validateSendAddress = createAsyncAction(
  WalletActionTypes.VALIDATE_SEND_ADDRESS,
  WalletActionTypes.VALIDATE_SEND_ADDRESS_SUCCESS,
  WalletActionTypes.VALIDATE_SEND_ADDRESS_FAILURE,
)<string, AddressData, ErrorMessage>();

export const validateAmount = createAsyncAction(
  WalletActionTypes.VALIDATE_AMOUNT,
  WalletActionTypes.VALIDATE_AMOUNT_SUCCESS,
  WalletActionTypes.VALIDATE_AMOUNT_FAILURE,
)<CalculateChangeParams, ChangeData, ErrorMessage>();

export const sendTransaction = createAsyncAction(
  WalletActionTypes.SEND_TRANSACTION,
  WalletActionTypes.SEND_TRANSACTION_SUCCESS,
  WalletActionTypes.SEND_TRANSACTION_FAILURE,
)<SendTransactionParams, void, ErrorMessage>();

export const setSelectedAssetId = createAction(WalletActionTypes.SET_SELECTED_ASSET_ID)<
WalletStateType['selected_asset_id']
>();
