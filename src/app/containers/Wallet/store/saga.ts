import { call, put } from 'redux-saga/effects';
import { getWalletStatus } from '@core/api';
import { AssetsEvent, TxsEvent } from '@core/types';
import { actions } from '.';

export function* handleTotals() {
  const { totals } = yield call(getWalletStatus);

  yield put(actions.setTotals(totals));
}

export function* handleAssets(payload: AssetsEvent) {
  yield put(actions.setAssets(payload.assets));
}

export function* handleTransactions(payload: TxsEvent) {
  yield put(actions.setTransactions(payload.txs));
}
