import {
  createEffect,
  createEvent, restore,
} from 'effector';
import { generateSeed, handleWalletEvent } from '@core/api';
import { BackgroundEvent, ConnectedData, NotificationType } from '@app/core/types';
import { isNil } from '@app/core/utils';
import NotificationController from '@core/NotificationController';

import { setView, View } from './view';

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

export const setSeed = createEvent<string[]>();

export const generateSeedFx = createEffect(generateSeed);

export const $seed = restore(generateSeedFx.doneData, []);

$seed.reset(generateSeedFx);
$seed.on(setSeed, (state, payload) => payload);

$ids.on(generateSeedFx.doneData, () => getRandomIds());

handleWalletEvent<ConnectedData>(
  BackgroundEvent.CONNECTED,
  ({
    is_running,
    onboarding,
    notification,
  }) => {
    if (!isNil(notification)) {
      NotificationController.setNotification(notification);
      if (notification.type === NotificationType.APPROVE_INVOKE) {
        setView(is_running ? View.APPROVEINVOKE : View.LOGIN);
      } else if (notification.type === NotificationType.CONNECT) {
        setView(is_running ? View.CONNECT : View.LOGIN);
      }
    } else {
      setOnboarding(onboarding);
      setView(is_running ? View.WALLET : View.LOGIN);
    }
  },
);
