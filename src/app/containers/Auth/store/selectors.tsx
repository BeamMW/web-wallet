import { createSelector } from 'reselect';
import { AppState } from '../../../shared/interface';

const selectAuth = (state: AppState) => state.auth;

export const selectWalletSyncState = () => createSelector(selectAuth, (state) => state.sync_progress);
