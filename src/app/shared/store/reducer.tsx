import produce from 'immer';
import { ActionType, createReducer } from 'typesafe-actions';

import { isWalletLockedSync } from '@core/lockState';

import { SharedStateType } from '../interface';
import * as actions from './actions';

type Action = ActionType<typeof actions>;

const initialState: SharedStateType = {
  routerLink: '',
  errorMessage: null,
  isBalanceHidden: !!localStorage.getItem('isBalanceHidden'),
  // Seeded from the session-storage mirror; index.tsx hydrates it and dispatches
  // setLockState before the first render, so this is only a placeholder.
  isLocked: isWalletLockedSync(),
  isAssetSync: !!localStorage.getItem('asset_sync'),
  isLoading: false,
};

const reducer = createReducer<SharedStateType, Action>(initialState)
  .handleAction(actions.navigate, (state, action) => produce(state, (nexState) => {
    nexState.routerLink = action.payload;
  }))
  .handleAction(actions.setError, (state, action) => produce(state, (nexState) => {
    nexState.errorMessage = action.payload;
  }))
  .handleAction(actions.hideBalances, (state) => produce(state, (nexState) => {
    nexState.isBalanceHidden = !state.isBalanceHidden;
    if (nexState.isBalanceHidden) {
      localStorage.setItem('isBalanceHidden', 'hidden');
    } else {
      localStorage.removeItem('isBalanceHidden');
    }
  }))
  // Persisting the flag is the sagas' job (chrome.storage.session is async);
  // the reducer stays pure.
  .handleAction(actions.lockWallet, (state) => produce(state, (nexState) => {
    nexState.isLocked = true;
  }))
  .handleAction(actions.unlockWallet, (state) => produce(state, (nexState) => {
    nexState.isLocked = false;
  }))
  .handleAction(actions.setLockState, (state, action) => produce(state, (nexState) => {
    nexState.isLocked = action.payload;
  }))
  .handleAction(actions.setAssetSync, (state) => produce(state, (nexState) => {
    nexState.isAssetSync = true;
    localStorage.setItem('asset_sync', '1');
  }))
  .handleAction(actions.unsetAssetSync, (state) => produce(state, (nexState) => {
    nexState.isAssetSync = false;
    localStorage.removeItem('asset_sync');
  }))
  .handleAction(actions.setIsLoading, (state, action) => produce(state, (nexState) => {
    nexState.isLoading = action.payload;
  }));

export { reducer as SharedReducer };
