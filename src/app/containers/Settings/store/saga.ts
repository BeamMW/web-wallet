import { takeLatest, put, call } from 'redux-saga/effects';
import { actions } from '@app/containers/Settings/store';
import { navigate, setError } from '@app/shared/store/actions';
import {
  deleteWallet, loadBackgroundLogs, loadConnectedSites, getVersion, disconnectAllowedSite,
} from '@core/api';
import { ROUTES } from '@app/shared/constants';
import { VersionInterface, connectedSiteInterface } from '@app/containers/Settings/interfaces';
import { setDefaultSyncState } from '@app/containers/Auth/store/actions';
import { setTransactions } from '@app/containers/Transactions/store/actions';
import store from '../../../../index';

function* deleteWalletSaga(action: ReturnType<typeof actions.deleteWallet.request>): Generator {
  try {
    yield put(actions.deleteWallet.success());
    yield call(deleteWallet, action.payload);
    yield put(setTransactions([]));
    yield put(setError(null));
    yield put(navigate(ROUTES.AUTH.BASE));
    yield put(setDefaultSyncState());
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

function* loadSites(): Generator {
  try {
    const sites = (yield call(loadConnectedSites) as unknown) as connectedSiteInterface[];
    yield put(actions.loadConnectedSites.success(sites));
  } catch (e) {
    yield put(actions.loadConnectedSites.failure(e));
  }
}

function* disconnectSite(action: ReturnType<typeof actions.disconnectAllowedSite.request>): Generator {
  try {
    yield call(disconnectAllowedSite, action.payload);
    yield put(actions.disconnectAllowedSite.success());
    store.dispatch(actions.loadConnectedSites.request());
  } catch (e) {
    yield put(actions.disconnectAllowedSite.failure(e));
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
  yield takeLatest(actions.loadConnectedSites.request, loadSites);
  yield takeLatest(actions.disconnectAllowedSite.request, disconnectSite);
}

export default settingsSaga;
