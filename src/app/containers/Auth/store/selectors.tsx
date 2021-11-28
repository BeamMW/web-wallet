import { createSelector } from 'reselect';
import { AppState } from '../../../shared/interface';

const selectAuth = (state: AppState) => state.auth;

export const selectWalletSyncState = () => createSelector(selectAuth, (state) => state.sync_progress);

export const selectSeedErrors = () => createSelector(selectAuth, (state) => state.seed_errors);
export const selectSeedValues = () => createSelector(selectAuth, (state) => state.seed_values);
export const selectSeedCache = () => createSelector(selectAuth, (state) => state.seed_result);
export const selectSeedIds = () => createSelector(selectAuth, (state) => state.seed_ids);
export const selectRegistrationSeed = () => createSelector(selectAuth, (state) => state.registration_seed);
export const selectIsRestore = () => createSelector(selectAuth, (state) => state.is_restore);
