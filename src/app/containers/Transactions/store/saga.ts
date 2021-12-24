import { call, put, takeLatest } from 'redux-saga/effects';
import { getTransactionStatus } from '@core/api';
import { TransactionDetail, TxsEvent } from '@core/types';

import { actions } from '.';

export function* handleTransactions(payload: TxsEvent) {
  yield put(actions.setTransactions(payload.txs));
}

export function* loadTransactionStatusSaga(
  action: ReturnType<typeof actions.loadTransactionStatus.request>,
): Generator {
  try {
    const txDetail = (yield call(getTransactionStatus, action.payload) as unknown) as TransactionDetail;

    yield put(actions.loadTransactionStatus.success(txDetail));
  } catch (e) {
    yield put(actions.loadTransactionStatus.failure(e));
  }
}

function* transactionsSaga() {
  yield takeLatest(actions.loadTransactionStatus.request, loadTransactionStatusSaga);
}

export default transactionsSaga;
