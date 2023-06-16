import produce from 'immer';
import { ActionType, createReducer } from 'typesafe-actions';

import { SharedStateType } from '../interface';
import * as actions from './actions';

type Action = ActionType<typeof actions>;

const initialState: SharedStateType = {
  routerLink: '',
  errorMessage: null,
  isBalanceHidden: !!localStorage.getItem('isBalanceHidden') ?? false,
  isLocked: !!localStorage.getItem('locked') ?? false,
  isAssetSync: !!localStorage.getItem('asset_sync') ?? false,
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
  .handleAction(actions.lockWallet, (state) => produce(state, (nexState) => {
    nexState.isLocked = true;
    localStorage.setItem('locked', '1');
  }))
  .handleAction(actions.unlockWallet, (state) => produce(state, (nexState) => {
    nexState.isLocked = false;
    localStorage.removeItem('locked');
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
