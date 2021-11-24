import { call, take, put } from 'redux-saga/effects';

import { eventChannel, END } from 'redux-saga';
import { initRemoteWallet } from '@core/api';
import {
  BackgroundEvent, ConnectedData, NotificationType, RemoteResponse,
} from '@core/types';

import { navigate } from '@app/shared/store/actions';
import { ROUTES } from '@app/shared/constants';
import NotificationController from '@core/NotificationController';

export function remoteEventChannel() {
  // @ts-ignore
  return eventChannel((emitter) => {
    const port = initRemoteWallet();

    const handler = (data: any) => {
      emitter(data);
    };

    port.onMessage.addListener(handler);

    const unsubscribe = () => {
      port.onMessage.removeListener(handler);
      emitter(END);
    };

    return unsubscribe;
  });
}

function* handleConnect({ notification, is_running, onboarding }: ConnectedData) {
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

function* sharedSaga() {
  const remoteChannel = yield call(remoteEventChannel);
  while (true) {
    try {
      // An error from socketChannel will cause the saga jump to the catch block
      const payload: RemoteResponse = yield take(remoteChannel);

      console.log(payload.method);

      switch (payload.id) {
        case BackgroundEvent.CONNECTED:
          yield call(handleConnect, payload.result);
          return;

        default:
          console.log('remoteChannel', payload);
      }
    } catch (err) {
      console.error('remoteChannel error:', err);

      remoteChannel.close();
    }
  }
}

export default sharedSaga;
