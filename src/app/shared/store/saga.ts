import { call, take } from 'redux-saga/effects';

import { eventChannel, END } from 'redux-saga';
import { initRemoteWallet } from '@core/api';
import { BackgroundEvent, RemoteResponse, RPCEvent } from '@core/types';

import { handleConnect, handleProgress } from '@app/containers/Auth/store/saga';

export function remoteEventChannel() {
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

function* sharedSaga() {
  const remoteChannel = yield call(remoteEventChannel);
  while (true) {
    try {
      // An error from socketChannel will cause the saga jump to the catch block
      const payload: RemoteResponse = yield take(remoteChannel);

      switch (payload.id) {
        case BackgroundEvent.CONNECTED:
          yield call(handleConnect, payload.result);
          break;

        case RPCEvent.SYNC_PROGRESS:
          yield call(handleProgress, payload.result);
          break;

        default:
          // console.log('remoteChannel', payload);
          break;
      }
    } catch (err) {
      console.error('remoteChannel error:', err);

      remoteChannel.close();
    }
  }
}

export default sharedSaga;
