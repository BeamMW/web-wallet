import { createEvent, restore } from 'effector';

export enum View {
  LOGIN,
  CREATE,
  RESTORE,
  SET_PASSWORD,
  PROGRESS,
  PORTFOLIO,
}

export const setView = createEvent<View>();

export const $view = restore(setView, View.LOGIN);
