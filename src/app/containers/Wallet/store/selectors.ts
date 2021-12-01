import { createSelector } from 'reselect';
import { AppState } from '../../../shared/interface';

const selectWallet = (state: AppState) => state.wallet;

export const selectAssets = () => createSelector(selectWallet, (state) => state.assets_total);

export const selectTransactions = () => createSelector(selectWallet, (state) => state.transactions);
