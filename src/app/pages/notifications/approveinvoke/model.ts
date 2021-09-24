import { createEvent, restore } from 'effector';
import { NotificationParams } from '@core/types';

export const setParams = createEvent<NotificationParams>();

export const $params = restore(setParams, {
  info: '',
  amounts: '',
  req: '',
});
