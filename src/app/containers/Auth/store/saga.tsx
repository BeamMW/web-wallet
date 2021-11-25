import { call, put, takeLatest } from 'redux-saga/effects';

import { getEnvironment, startWallet } from '@core/api';
import { navigate, setError } from '@app/shared/store/actions';
import { ROUTES } from '@app/shared/constants';
import {
  ConnectedData, Environment, NotificationType, SyncProgress,
} from '@core/types';
import NotificationController from '@core/NotificationController';
import { actions } from '.';
import store from '../../../../index';

export function* handleConnect({ notification, is_running, onboarding }: ConnectedData) {
  if (onboarding) {
    yield put(navigate(ROUTES.AUTH.BASE));
    return;
  }
  if (notification) {
    NotificationController.setNotification(notification);
    if (notification.type === NotificationType.APPROVE_INVOKE) {
      yield put(navigate(is_running ? ROUTES.NOTIFICATIONS.APPROVE_INVOKE : ROUTES.AUTH.LOGIN));
    } else if (notification.type === NotificationType.CONNECT) {
      yield put(navigate(is_running ? ROUTES.NOTIFICATIONS.CONNECT : ROUTES.AUTH.LOGIN));
    }
  } else {
    yield put(navigate(is_running ? ROUTES.WALLET.BASE : ROUTES.AUTH.LOGIN));
  }
}

export function* handleProgress({
  sync_requests_done,
  sync_requests_total,
  current_state_hash,
  tip_state_hash,
}: SyncProgress) {
  const { is_wallet_synced } = store.getState().auth;
  if (is_wallet_synced) return;
  if (current_state_hash === tip_state_hash) {
    yield put(actions.setSyncedWalletState(true));
    if (getEnvironment() !== Environment.NOTIFICATION) {
      yield put(navigate(ROUTES.WALLET.BASE));
    } else {
      const notification = NotificationController.getNotification();
      if (notification.type === NotificationType.CONNECT) {
        yield put(navigate(ROUTES.NOTIFICATIONS.CONNECT));
      } else if (notification.type === NotificationType.APPROVE_INVOKE) {
        yield put(navigate(ROUTES.NOTIFICATIONS.APPROVE_INVOKE));
      }
    }
  } else {
    yield put(actions.updateWalletSyncProgress({ sync_requests_done, sync_requests_total }));
  }
}

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
