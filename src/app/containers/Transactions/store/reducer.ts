import produce from 'immer';
import { ActionType, createReducer } from 'typesafe-actions';

import { deleteWallet } from '@app/containers/Settings/store/actions';
import { TransactionsStateType } from '../interfaces';
import * as actions from './actions';

type Action = ActionType<typeof actions & typeof deleteWallet>;

const initialState: TransactionsStateType = {
  transactions: [],
  transaction_detail: null,
  payment_proof: null,
};

const reducer = createReducer<TransactionsStateType, Action>(initialState)
  .handleAction(actions.setTransactions, (state, action) => produce(state, (nexState) => {
    nexState.transactions = state.transactions.length
      ? [...new Map([...state.transactions, ...action.payload].map((item) => [item.txId, item])).values()]
      : action.payload;
  }))
  .handleAction(actions.loadTransactionStatus.success, (state, action) => produce(state, (nexState) => {
    nexState.transaction_detail = action.payload;
  }))
  .handleAction(actions.setPaymentProof, (state, action) => produce(state, (nexState) => {
    nexState.payment_proof = action.payload;
  }))
  .handleAction(deleteWallet.success, (state) => produce(state, (nexState) => ({ ...nexState, ...initialState })));

export { reducer as TransactionsReducer };
