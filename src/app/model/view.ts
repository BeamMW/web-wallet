import { curry, makePrevented } from '@core/utils';
import { createEvent, restore, sample } from 'effector';

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
  SETTINGS,
  // notifications
  CONNECT,
  APPROVEINVOKE,
}

export const setView = createEvent<View>();
export const $view = restore(setView, View.PROGRESS);

export const gotoSend = makePrevented(
  curry(setView, View.SEND_FORM),
);

export const gotoReceive = makePrevented(
  curry(setView, View.RECEIVE),
);

export const gotoWallet = curry(setView, View.WALLET);

export const gotoForm = makePrevented(
  curry(setView, View.SEND_FORM),
);

export const gotoConfirm = curry(setView, View.SEND_CONFIRM);

export const onPreviousClick = createEvent<React.SyntheticEvent>();

export const $backButtonShown = $view.map((view) => view !== View.WALLET);

// go back 1 screen
sample({
  source: $view,
  clock: onPreviousClick,
  fn: (view) => {
    switch (view) {
      case View.SEND_CONFIRM:
        return View.SEND_FORM;
      case View.RESTORE:
      case View.CREATE:
      case View.SET_PASSWORD:
        return View.LOGIN;
      default:
        return View.WALLET;
    }
  },
  target: setView,
});
