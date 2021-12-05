import { call, put, takeLatest } from 'redux-saga/effects';
import { getWalletStatus, createAddress } from '@core/api';
import { AssetsEvent, TxsEvent } from '@core/types';
import { RateResponse } from '@app/containers/Wallet/interfaces';
import { actions } from '.';
import store from '../../../../index';

const FETCH_INTERVAL = 310000;

const API_URL = 'https://api.coingecko.com/api/v3/simple/price';
const RATE_PARAMS = 'ids=beam&vs_currencies=usd';

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

async function loadRatesApiCall() {
  const response = await fetch(`${API_URL}?${RATE_PARAMS}`);
  const promise: RateResponse = await response.json();
  return promise.beam.usd;
}

export function* loadRate() {
  try {
    const result: number = yield call(loadRatesApiCall);

    yield put(actions.loadRate.success(result));
    setTimeout(() => store.dispatch(actions.loadRate.request()), FETCH_INTERVAL);
  } catch (e) {
    yield put(actions.loadRate.failure(e));
  }
}

export function* generateAddress(action: ReturnType<typeof actions.generateAddress.request>): Generator {
  try {
    const result: string = (yield call(createAddress, action.payload) as unknown) as string;

    yield put(actions.generateAddress.success(result));
  } catch (e) {
    yield put(actions.generateAddress.failure(e));
  }
}

function* walletSaga() {
  yield takeLatest(actions.loadRate.request, loadRate);
  yield takeLatest(actions.generateAddress.request, generateAddress);
}

export default walletSaga;
