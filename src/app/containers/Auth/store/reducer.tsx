import produce from 'immer';
import { ActionType, createReducer } from 'typesafe-actions';

import { AuthStateType } from '../interfaces';
import * as actions from './actions';

type Action = ActionType<typeof actions>;

export const SEED_PHRASE_COUNT = 12;

const INITIAL: null[] = new Array(SEED_PHRASE_COUNT).fill(null);

const initialState: AuthStateType = {
  is_wallet_synced: false,
  sync_progress: {
    sync_requests_done: 0,
    sync_requests_total: 0,
  },
  seed_errors: [...INITIAL],
  seed_values: [...INITIAL],
  seed_result: null,
};

const reducer = createReducer<AuthStateType, Action>(initialState)
  .handleAction(actions.setSyncedWalletState, (state, action) => produce(state, (nexState) => {
    nexState.is_wallet_synced = action.payload;
  }))
  .handleAction(actions.updateWalletSyncProgress, (state, action) => produce(state, (nexState) => {
    nexState.sync_progress = action.payload;
  }))
  .handleAction(actions.updateSeedList.success, (state, action) => produce(state, (nexState) => {
    const { seed_errors, seed_values } = state;
    const new_values = [...seed_values];
    const new_seed_errors = [...seed_errors];
    new_values[action.payload.index] = action.payload.value;
    new_seed_errors[action.payload.index] = action.payload.value ? action.payload.valid : null;
    nexState.seed_errors = new_seed_errors;
    nexState.seed_values = new_values;
  }))
  .handleAction(actions.resetRestoreState, (state) => produce(state, (nexState) => {
    nexState.seed_errors = [...INITIAL];
    nexState.seed_values = [...INITIAL];
  }))
  .handleAction(actions.checkIsAllowedSeed.success, (state, action) => produce(state, (nexState) => {
    nexState.seed_errors = action.payload.valid;
    nexState.seed_values = action.payload.values;
  }));

export { reducer as AuthReducer };
