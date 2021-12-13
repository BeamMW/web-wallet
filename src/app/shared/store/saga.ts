import { call, take, fork } from 'redux-saga/effects';

import { eventChannel, END } from 'redux-saga';
import { initRemoteWallet } from '@core/api';
import { BackgroundEvent, RemoteResponse, RPCEvent } from '@core/types';

import { handleConnect, handleProgress } from '@app/containers/Auth/store/saga';
import { handleTotals, handleAssets, handleTransactions } from '@app/containers/Wallet/store/saga';

export function remoteEventChannel() {
  return eventChannel((emitter) => {
    const port = initRemoteWallet();

    const handler = (data: RemoteResponse) => {
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
          yield fork(handleConnect, payload.result);
          break;

        case RPCEvent.SYNC_PROGRESS:
          yield fork(handleProgress, payload.result);
          break;

        case RPCEvent.ASSETS_CHANGED:
          yield fork(handleAssets, payload.result);
          break;

        case RPCEvent.SYSTEM_STATE:
          yield fork(handleTotals);
          break;

        case RPCEvent.TXS_CHANGED:
          yield fork(handleTransactions, payload.result);
          break;

        default:
          //  console.log('remoteChannel', payload);
          break;
      }
    } catch (err) {
      remoteChannel.close();
    }
  }
}

export default sharedSaga;
