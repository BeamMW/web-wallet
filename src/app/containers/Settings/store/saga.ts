import { takeLatest, put, call } from 'redux-saga/effects';
import { actions } from '@app/containers/Settings/store';
import { navigate, setError } from '@app/shared/store/actions';
import { deleteWallet, loadBackgroundLogs, getVersion } from '@core/api';
import { ROUTES } from '@app/shared/constants';
import { VersionInterface } from '@app/containers/Settings/interfaces';

function* deleteWalletSaga(action: ReturnType<typeof actions.deleteWallet.request>): Generator {
  try {
    yield call(deleteWallet, action.payload);
    yield put(setError(null));
    yield put(navigate(ROUTES.AUTH.BASE));
  } catch (e) {
    yield put(setError(e));
    yield put(actions.deleteWallet.failure(e));
  }
}

function* loadLogs(): Generator {
  try {
    const logs = (yield call(loadBackgroundLogs) as unknown) as string;
    yield put(actions.loadLogs.success(logs));
  } catch (e) {
    yield put(actions.loadLogs.failure(e));
  }
}

function* loadVersion(): Generator {
  try {
    const version = (yield call(getVersion) as unknown) as VersionInterface;
    yield put(actions.loadVersion.success(version));
  } catch (e) {
    yield put(actions.loadVersion.failure(e));
  }
}

function* settingsSaga() {
  yield takeLatest(actions.deleteWallet.request, deleteWalletSaga);
  yield takeLatest(actions.loadLogs.request, loadLogs);
  yield takeLatest(actions.loadVersion.request, loadVersion);
}

export default settingsSaga;
