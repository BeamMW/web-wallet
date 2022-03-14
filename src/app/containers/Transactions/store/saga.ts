import { call, put, takeLatest } from 'redux-saga/effects';
import { getTransactionStatus, exportPaymentProof, verifyPaymentProof } from '@core/api';
import { PaymentProof, TransactionDetail, TxsEvent } from '@core/types';

import { setPaymentProof } from '@app/containers/Transactions/store/actions';
import { actions } from '.';

export function* handleTransactions(payload: TxsEvent) {
  console.log(payload);
  yield put(actions.setTransactions(payload.txs));
}

export function* loadTransactionStatusSaga(
  action: ReturnType<typeof actions.loadTransactionStatus.request>,
): Generator {
  try {
    const txDetail: TransactionDetail = (yield call(
      getTransactionStatus,
      action.payload,
    ) as unknown) as TransactionDetail;

    yield put(actions.loadTransactionStatus.success(txDetail));

    if (!txDetail.income && !txDetail.status_string.includes('failed')) {
      const payment_proof: { payment_proof: string } = (yield call(exportPaymentProof, action.payload) as unknown) as {
        payment_proof: string;
      };
      const payment_proof_validation = (yield call(
        verifyPaymentProof,
        payment_proof.payment_proof,
      ) as unknown) as PaymentProof;

      yield put(setPaymentProof({ ...payment_proof_validation, ...payment_proof }));
    }
  } catch (e) {
    yield put(actions.loadTransactionStatus.failure(e));
  }
}

function* transactionsSaga() {
  yield takeLatest(actions.loadTransactionStatus.request, loadTransactionStatusSaga);
}

export default transactionsSaga;
