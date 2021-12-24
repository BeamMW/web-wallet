import { createSelector } from 'reselect';
import { AppState } from '../../../shared/interface';

const selectTransactionsState = (state: AppState) => state.transactions;

export const selectTransactions = () => createSelector(selectTransactionsState, (state) => state.transactions);
