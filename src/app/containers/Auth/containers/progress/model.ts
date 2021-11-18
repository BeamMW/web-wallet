import { createEvent, guard, restore } from 'effector';

import {
  RPCEvent, SyncProgress, Environment, NotificationType,
} from '@core/types';
import { $view, View } from '@model/view';
import { remoteEvent, getEnvironment } from '@core/api';
import NotificationController from '@core/NotificationController';
import { ROUTES } from '@app/shared/constants';
import { navigate } from '@app/shared/store/actions';
import store from '../../../../../index';

export const setSyncProgress = createEvent<[number, number]>();

export const $syncProgress = restore(setSyncProgress, [0, 0]);

export const $syncPercent = $syncProgress.map<number>((state, last) => {
  const [done, total] = state;
  const next = done === 0 ? 0 : Math.floor((done / total) * 100);
  if (last >= next) {
    return last;
  }
  return next;
});

export const setLoading = createEvent<boolean>();

// todo fix
export const $loading = $view.map((view) => view === View.PROGRESS);

// receive Progress data
const onProgress = remoteEvent.filterMap(({ id, result }) => (id === RPCEvent.SYNC_PROGRESS ? (result as SyncProgress) : undefined));

guard(onProgress, {
  filter: $loading,
}).watch(({
  sync_requests_done, sync_requests_total, current_state_hash, tip_state_hash,
}) => {
  if (current_state_hash === tip_state_hash) {
    setLoading(false);
    if (getEnvironment() !== Environment.NOTIFICATION) {
      store.dispatch(navigate(ROUTES.WALLET.BASE));
    } else {
      const notification = NotificationController.getNotification();
      if (notification.type === NotificationType.CONNECT) {
        store.dispatch(navigate(ROUTES.NOTIFICATIONS.CONNECT));
      } else if (notification.type === NotificationType.APPROVE_INVOKE) {
        store.dispatch(navigate(ROUTES.NOTIFICATIONS.APPROVE_INVOKE));
      }
    }
  } else {
    setSyncProgress([sync_requests_done, sync_requests_total]);
  }
});
