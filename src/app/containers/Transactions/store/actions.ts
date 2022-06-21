import { createAction, createAsyncAction } from 'typesafe-actions';
import { Transaction, TransactionDetail } from '@core/types';
import { ErrorMessage } from '@core/WasmWallet';
import { TransactionsStateType } from '@app/containers/Transactions/interfaces';
import { TransactionsActionTypes } from './constants';

export const setTransactions = createAction(TransactionsActionTypes.SET_TRANSACTIONS)<Transaction[]>();

export const setPaymentProof = createAction(TransactionsActionTypes.SET_PAYMENT_PROOF)<
  TransactionsStateType['payment_proof']
>();

export const loadTransactionStatus = createAsyncAction(
  TransactionsActionTypes.LOAD_TRANSACTION_STATUS,
  TransactionsActionTypes.LOAD_TRANSACTION_STATUS_SUCCESS,
  TransactionsActionTypes.LOAD_TRANSACTION_STATUS_FAILURE,
)<string, TransactionDetail, ErrorMessage>();
