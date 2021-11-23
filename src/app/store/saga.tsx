import { all, fork } from 'redux-saga/effects';
import sharedSaga from '@app/shared/store/saga';

const allSagas = [sharedSaga];

export default function* appSagas() {
  yield all(allSagas.map(fork));
}
