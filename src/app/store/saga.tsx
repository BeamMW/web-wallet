import { all, fork } from 'redux-saga/effects';

const allSagas = [];

export default function* appSagas() {
  yield all(allSagas.map(fork));
}
