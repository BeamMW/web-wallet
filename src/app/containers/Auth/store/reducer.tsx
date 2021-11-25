import produce from 'immer';
import { ActionType, createReducer } from 'typesafe-actions';

import { AuthStateType } from '../interfaces';
import * as actions from './actions';

type Action = ActionType<typeof actions>;

const initialState: AuthStateType = {
  is_wallet_synced: false,
  sync_progress: {
    sync_requests_done: 0,
    sync_requests_total: 0,
  },
};

const reducer = createReducer<AuthStateType, Action>(initialState)
  .handleAction(actions.setSyncedWalletState, (state, action) => produce(state, (nexState) => {
    nexState.is_wallet_synced = action.payload;
  }))
  .handleAction(actions.updateWalletSyncProgress, (state, action) => produce(state, (nexState) => {
    nexState.sync_progress = action.payload;
  }));

export { reducer as AuthReducer };
