import produce from 'immer';
import { ActionType, createReducer } from 'typesafe-actions';

import { AuthStateType, SyncStep } from '../interfaces';
import * as actions from './actions';

type Action = ActionType<typeof actions>;

export const SEED_PHRASE_COUNT = 12;

const INITIAL: null[] = new Array(SEED_PHRASE_COUNT).fill(null);

const initialState: AuthStateType = {
  is_wallet_synced: false,
  sync_step: SyncStep.SYNC,
  sync_progress: {
    sync_requests_done: 0,
    sync_requests_total: 0,
  },
  download_db_progress: {
    done: 0,
    total: 0,
  },
  database_sync_progress: {
    done: 0,
    total: 0,
  },
  seed_errors: [...INITIAL],
  seed_values: [...INITIAL],
  seed_result: null,
  is_restore: false,
  registration_seed: '',
  seed_ids: [],
};

const reducer = createReducer<AuthStateType, Action>(initialState)
  .handleAction(actions.setSyncedWalletState, (state, action) => produce(state, (nexState) => {
    nexState.is_wallet_synced = action.payload;
  }))
  .handleAction(actions.updateWalletSyncProgress, (state, action) => produce(state, (nexState) => {
    nexState.sync_progress = action.payload;
  }))
  .handleAction(actions.setSyncStep, (state, action) => produce(state, (nexState) => {
    nexState.sync_step = action.payload;
  }))
  .handleAction(actions.downloadDatabaseFile, (state, action) => produce(state, (nexState) => {
    nexState.download_db_progress = action.payload;
  }))
  .handleAction(actions.restoreWallet, (state, action) => produce(state, (nexState) => {
    nexState.database_sync_progress = action.payload;
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
  }))
  .handleAction(actions.generateRegistrationSeed.success, (state, action) => produce(state, (nexState) => {
    nexState.registration_seed = action.payload.registration_seed;
    nexState.seed_ids = action.payload.seed_ids;
  }))
  .handleAction(actions.setRegistrationSeed, (state, action) => produce(state, (nexState) => {
    nexState.registration_seed = action.payload.registration_seed;
    nexState.is_restore = action.payload.is_restore;
  }));

export { reducer as AuthReducer };
