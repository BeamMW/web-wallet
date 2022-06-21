import { call, put, takeLatest } from 'redux-saga/effects';

import {
  finishNotificationAuth,
  generateSeed,
  getEnvironment,
  isAllowedSeed,
  isAllowedWord,
  startWallet,
} from '@core/api';
import { navigate, setError, unlockWallet } from '@app/shared/store/actions';
import { ROUTES } from '@app/shared/constants';
import {
  ConnectedData, Environment, NotificationType, SyncProgress,
} from '@core/types';
import NotificationController from '@core/NotificationController';
import { DatabaseSyncProgress, SyncStep } from '@app/containers/Auth/interfaces';

import { actions } from '.';
import store from '../../../../index';

const SEED_CONFIRM_COUNT = 6;

const getRandomIds = () => {
  const result: number[] = [];
  while (result.length < SEED_CONFIRM_COUNT) {
    const value = Math.floor(Math.random() * 12);
    if (!result.includes(value)) {
      result.push(value);
    }
  }
  return result;
};

export function* handleConnect({ notification, is_running, onboarding }: ConnectedData) {
  if (onboarding) {
    yield put(navigate(ROUTES.AUTH.BASE));
    return;
  }
  if (notification) {
    NotificationController.setNotification(notification);
    if (notification.type === NotificationType.AUTH) {
      yield put(navigate(ROUTES.AUTH.LOGIN));
    } else if (notification.type === NotificationType.APPROVE_TX) {
      yield put(navigate(is_running ? ROUTES.NOTIFICATIONS.APPROVE_SEND : ROUTES.AUTH.LOGIN));
    } else if (notification.type === NotificationType.APPROVE_INVOKE) {
      yield put(navigate(is_running ? ROUTES.NOTIFICATIONS.APPROVE_INVOKE : ROUTES.AUTH.LOGIN));
    } else if (notification.type === NotificationType.CONNECT) {
      yield put(navigate(is_running ? ROUTES.NOTIFICATIONS.CONNECT : ROUTES.AUTH.LOGIN));
    }
  } else {
    yield put(navigate(is_running && localStorage.getItem('lock') ? ROUTES.WALLET.BASE : ROUTES.AUTH.LOGIN));
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
    const isLocked = localStorage.getItem('locked');
    if (getEnvironment() !== Environment.NOTIFICATION) {
      if (isLocked) {
        yield put(navigate(ROUTES.AUTH.LOGIN));
      } else {
        yield put(navigate(ROUTES.WALLET.BASE));
      }
    } else {
      const notification = NotificationController.getNotification();
      if (notification.type === NotificationType.AUTH) {
        if (!isLocked) {
          finishNotificationAuth(
            notification.params.apiver,
            notification.params.apivermin,
            notification.params.appname,
            notification.params.appurl,
          );
        }
      } else if (notification.type === NotificationType.CONNECT) {
        yield put(navigate(ROUTES.NOTIFICATIONS.CONNECT));
      } else if (notification.type === NotificationType.APPROVE_TX) {
        yield put(navigate(ROUTES.NOTIFICATIONS.APPROVE_SEND));
      } else if (notification.type === NotificationType.APPROVE_INVOKE) {
        yield put(navigate(ROUTES.NOTIFICATIONS.APPROVE_INVOKE));
      }
    }
  } else if (sync_requests_done !== 0) {
    yield put(actions.setSyncStep(SyncStep.SYNC));
    yield put(
      actions.updateWalletSyncProgress({
        sync_requests_done,
        sync_requests_total,
      }),
    );
  }
}

export function* handleSyncStep(payload: SyncStep) {
  yield put(actions.setSyncStep(payload));
}

export function* handleUnlockWallet(payload: boolean) {
  yield put(unlockWallet());
  const notification = NotificationController.getNotification();
  if (!notification) {
    if (payload) {
      store.dispatch(navigate(ROUTES.WALLET.BASE));
    } else {
      store.dispatch(navigate(ROUTES.AUTH.PROGRESS));
    }
  }
}

export function* handleDatabaseSyncProgress(payload: DatabaseSyncProgress) {
  yield put(actions.downloadDatabaseFile(payload));
  yield put(actions.setSyncStep(SyncStep.DOWNLOAD));
  yield put(navigate(ROUTES.AUTH.PROGRESS));
}
export function* handleDatabaseRestore(payload: DatabaseSyncProgress) {
  yield put(actions.restoreWallet(payload));
  yield put(actions.setSyncStep(SyncStep.RESTORE));
  if (payload.total !== payload.done) {
    yield put(navigate(ROUTES.AUTH.PROGRESS));
  } else {
    yield put(navigate(ROUTES.WALLET.BASE));
  }
}

function* startWalletSaga(action: ReturnType<typeof actions.startWallet.request>): Generator {
  try {
    yield put(navigate(ROUTES.AUTH.PROGRESS));
    yield call(startWallet, action.payload);
  } catch (e) {
    yield put(setError(e));
    yield put(actions.startWallet.failure(e));
    yield put(navigate(ROUTES.AUTH.LOGIN));
  }
}

function* updateSeedList(action: ReturnType<typeof actions.updateSeedList.request>): Generator {
  try {
    const { value, name } = action.payload.target;
    const valid = yield call(isAllowedWord, value);

    yield put(actions.updateSeedList.success({ value, valid: !!valid, index: Number(name) }));
  } catch (e) {
    yield put(actions.updateSeedList.failure(e));
  }
}

function* checkIsAllowedSeed(action: ReturnType<typeof actions.checkIsAllowedSeed.request>): Generator {
  try {
    const data = action.payload;
    const result: boolean[] = (yield call(isAllowedSeed, data) as unknown) as boolean[];

    yield put(actions.checkIsAllowedSeed.success({ values: data, valid: result }));
  } catch (e) {
    yield put(actions.checkIsAllowedSeed.failure(e));
  }
}
function* generateRegistrationSeed(): Generator {
  try {
    const registration_seed: string = (yield call(generateSeed) as unknown) as string;

    const seed_ids = getRandomIds();
    yield put(actions.generateRegistrationSeed.success({ seed_ids, registration_seed }));
  } catch (e) {
    yield put(actions.generateRegistrationSeed.failure(e));
  }
}

function* authSaga() {
  yield takeLatest(actions.startWallet.request, startWalletSaga);
  yield takeLatest(actions.updateSeedList.request, updateSeedList);
  yield takeLatest(actions.checkIsAllowedSeed.request, checkIsAllowedSeed);
  yield takeLatest(actions.generateRegistrationSeed.request, generateRegistrationSeed);
}

export default authSaga;
