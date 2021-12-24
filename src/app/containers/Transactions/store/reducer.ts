import produce from 'immer';
import { ActionType, createReducer } from 'typesafe-actions';

import { TransactionsStateType } from '../interfaces';
import * as actions from './actions';

type Action = ActionType<typeof actions>;

const initialState: TransactionsStateType = {
  transactions: [],
};

const reducer = createReducer<TransactionsStateType, Action>(initialState).handleAction(
  actions.setTransactions,
  (state, action) => produce(state, (nexState) => {
    nexState.transactions = action.payload;
  }),
);

export { reducer as TransactionsReducer };
