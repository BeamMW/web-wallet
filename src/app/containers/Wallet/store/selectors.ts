import { createSelector } from 'reselect';
import { AppState } from '../../../shared/interface';

const selectWallet = (state: AppState) => state.wallet;

export const selectAssets = () => createSelector(selectWallet, (state) => state.assets_total);

export const selectTransactions = () => createSelector(selectWallet, (state) => state.transactions);

export const selectRate = () => createSelector(selectWallet, (state) => state.rate);

export const selectReceiveAmount = () => createSelector(selectWallet, (state) => state.receive_amount);

export const selectAddress = () => createSelector(selectWallet, (state) => state.address);
