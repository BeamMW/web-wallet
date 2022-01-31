import produce from 'immer';
import { ActionType, createReducer } from 'typesafe-actions';

import { SettingsStateType } from '../interfaces';
import * as actions from './actions';

type Action = ActionType<typeof actions>;

const initialState: SettingsStateType = {
  version: {
    beam_version: '',
    beam_branch_name: '',
  },
  logs: '',
  connectedSites: [],
};

const reducer = createReducer<SettingsStateType, Action>(initialState)
  .handleAction(actions.loadLogs.success, (state, action) => produce(state, (nexState) => {
    nexState.logs = action.payload;
  }))
  .handleAction(actions.loadConnectedSites.success, (state, action) => produce(state, (nexState) => {
    nexState.connectedSites = action.payload;
  }))
  .handleAction(actions.loadVersion.success, (state, action) => produce(state, (nexState) => {
    nexState.version = action.payload;
  }));

export { reducer as SettingsReducer };
