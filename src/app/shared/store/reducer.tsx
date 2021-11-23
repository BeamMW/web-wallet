import produce from 'immer';
import { ActionType, createReducer } from 'typesafe-actions';

import { SharedStateType } from '../interface';
import * as actions from './actions';

type Action = ActionType<typeof actions>;

const initialState: SharedStateType = {
  routerLink: '',
};

const reducer = createReducer<SharedStateType, Action>(initialState).handleAction(actions.navigate, (state, action) => produce(state, (nexState) => {
  nexState.routerLink = action.payload;
}));

export { reducer as SharedReducer };
