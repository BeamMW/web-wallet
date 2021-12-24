import { createAction, createAsyncAction } from 'typesafe-actions';
import { Transaction, TransactionDetail } from '@core/types';
import { ErrorMessage } from '@core/WasmWallet';
import { TransactionsActionTypes } from './constants';

export const setTransactions = createAction(TransactionsActionTypes.SET_TRANSACTIONS)<Transaction[]>();

export const loadTransactionStatus = createAsyncAction(
  TransactionsActionTypes.LOAD_TRANSACTION_STATUS,
  TransactionsActionTypes.LOAD_TRANSACTION_STATUS_SUCCESS,
  TransactionsActionTypes.LOAD_TRANSACTION_STATUS_FAILURE,
)<string, TransactionDetail, ErrorMessage>();
