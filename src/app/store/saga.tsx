import { all, fork } from 'redux-saga/effects';
import sharedSaga from '@app/shared/store/saga';
import authSaga from '@app/containers/Auth/store/saga';
import settingsSaga from '@app/containers/Settings/store/saga';
import walletSaga from '@app/containers/Wallet/store/saga';

const allSagas = [sharedSaga, authSaga, settingsSaga, walletSaga];

export default function* appSagas() {
  yield all(allSagas.map(fork));
}
