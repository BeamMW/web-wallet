import { createAction } from 'typesafe-actions';
import { SharedActionTypes } from './constants';

export const navigate = createAction(SharedActionTypes.NAVIGATE)<string>();
export const setError = createAction(SharedActionTypes.SET_ERROR)<string | null>();
export const lockWallet = createAction(SharedActionTypes.LOCK_WALLET)();
export const unlockWallet = createAction(SharedActionTypes.UNLOCK_WALLET)();
// Mirrors the persisted lock flag into the store without running the lock/unlock
// side effects (clearing the saved password, navigating).
export const setLockState = createAction(SharedActionTypes.SET_LOCK_STATE)<boolean>();
export const hideBalances = createAction(SharedActionTypes.HIDE_BALANCE)();
export const setAssetSync = createAction(SharedActionTypes.SYNC_ASSET)();
export const unsetAssetSync = createAction(SharedActionTypes.UNSET_SYNC_ASSET)();

export const setIsLoading = createAction(SharedActionTypes.SET_IS_LOADING)<boolean>();
