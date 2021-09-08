import { curry, makePrevented } from '@core/utils';
import { createEvent, restore } from 'effector';

export enum View {
  // intro
  LOGIN,
  CREATE,
  RESTORE,
  SET_PASSWORD,
  PROGRESS,
  // main
  WALLET,
  SEND_FORM,
  SEND_CONFIRM,
  RECEIVE,
  UTXO,
}

export const setView = createEvent<View>();
export const $view = restore(setView, View.LOGIN);

export const gotoSend = makePrevented(
  curry(setView, View.SEND_FORM),
);

export const gotoReceive = makePrevented(
  curry(setView, View.RECEIVE),
);

export const gotoWallet = makePrevented(
  curry(setView, View.WALLET),
);

export const gotoForm = makePrevented(
  curry(setView, View.SEND_FORM),
);

export const gotoConfirm = makePrevented(
  curry(setView, View.SEND_CONFIRM),
);
