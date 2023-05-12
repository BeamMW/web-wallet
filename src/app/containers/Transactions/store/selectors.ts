import { createSelector } from 'reselect';
import { AppState } from '@app/shared/interface';

const selectTransactionsState = (state: AppState) => state.transactions;

export const selectTransactions = () => createSelector(selectTransactionsState, (state) => state.transactions);

export const selectTransactionDetail = () => createSelector(selectTransactionsState, (state) => state.transaction_detail);

export const selectPaymentProof = () => createSelector(selectTransactionsState, (state) => state.payment_proof);
