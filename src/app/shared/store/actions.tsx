import { createAction } from 'typesafe-actions';
import { SharedActionTypes } from './constants';

export const navigate = createAction(SharedActionTypes.NAVIGATE)<string>();
export const setError = createAction(SharedActionTypes.SET_ERROR)<string | null>();
export const lockWallet = createAction(SharedActionTypes.LOCK_WALLET)();
export const unlockWallet = createAction(SharedActionTypes.UNLOCK_WALLET)();
export const hideBalances = createAction(SharedActionTypes.HIDE_BALANCE)();
