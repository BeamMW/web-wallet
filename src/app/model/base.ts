import { createEffect, createEvent, restore } from 'effector';

import { generateSeed, handleWalletEvent } from '@core/api';
import { BackgroundEvent, ConnectedData, NotificationType } from '@app/core/types';
import { isNil } from '@app/core/utils';
import NotificationController from '@core/NotificationController';
import { ROUTES } from '@app/shared/constants';
import { navigate } from '@app/shared/store/actions';
import store from '../../index';

export const setIds = createEvent<number[]>();
export const setOnboarding = createEvent<boolean>();

export const $ids = restore(setIds, []);
export const $onboarding = restore(setOnboarding, null);

const SEED_CONFIRM_COUNT = 6;

const getRandomIds = () => {
  const result = [];
  while (result.length < SEED_CONFIRM_COUNT) {
    const value = Math.floor(Math.random() * 12);
    if (!result.includes(value)) {
      result.push(value);
    }
  }
  return result;
};

type Seed = [string, boolean];

export const setSeed = createEvent<Seed>();

export const generateSeedFx = createEffect(generateSeed);

export const $seed = restore(setSeed, ['', false] as Seed);
export const $words = $seed.map(([seed]) => seed.split(' '));

$seed.reset(generateSeedFx);
$seed.on(generateSeedFx.doneData, (state, payload) => [payload, false]);

$ids.on(generateSeedFx.doneData, () => getRandomIds());

handleWalletEvent<ConnectedData>(BackgroundEvent.CONNECTED, ({ is_running, onboarding, notification }) => {
  setOnboarding(onboarding);
  if (!isNil(notification)) {
    NotificationController.setNotification(notification);
    if (notification.type === NotificationType.APPROVE_INVOKE) {
      store.dispatch(navigate(is_running ? ROUTES.NOTIFICATIONS.APPROVE_INVOKE : ROUTES.AUTH.LOGIN));
    } else if (notification.type === NotificationType.CONNECT) {
      store.dispatch(navigate(is_running ? ROUTES.NOTIFICATIONS.CONNECT : ROUTES.AUTH.LOGIN));
    }
  } else {
    store.dispatch(navigate(is_running ? ROUTES.WALLET.BASE : ROUTES.AUTH.LOGIN));
  }
});
