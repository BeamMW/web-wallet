import { call, put, takeLatest } from 'redux-saga/effects';

import { startWallet } from '@core/api';
import { navigate, setError } from '@app/shared/store/actions';
import { ROUTES } from '@app/shared/constants';
import { actions } from '.';

function* startWalletSaga(action: ReturnType<typeof actions.startWallet.request>): Generator {
  try {
    yield call(startWallet, action.payload);

    yield put(navigate(ROUTES.AUTH.PROGRESS));
  } catch (e) {
    yield put(setError(e));
    yield put(actions.startWallet.failure(e));
  }
}

function* authSaga() {
  yield takeLatest(actions.startWallet.request, startWalletSaga);
}

export default authSaga;
