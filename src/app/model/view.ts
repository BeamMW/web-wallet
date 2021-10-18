import { curry, makePrevented } from '@core/utils';
import { createEvent, restore, sample } from 'effector';

export enum View {
  // intro
  LOGIN,
  SEED_WARNING,
  SEED_WRITE,
  SEED_CONFIRM,
  RESTORE,
  SET_PASSWORD,
  PROGRESS,
  // main
  WALLET,
  SEND_FORM,
  SEND_CONFIRM,
  RECEIVE,
  UTXO,
  // settings
  SETTINGS,
  SETTINGS_REPORT,
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

export const gotoProgress = curry(setView, View.PROGRESS);

export const gotoForm = makePrevented(
  curry(setView, View.SEND_FORM),
);

export const gotoConfirm = curry(setView, View.SEND_CONFIRM);

export const gotoBack = createEvent<React.SyntheticEvent>();

// go back 1 screen
sample({
  source: $view,
  clock: gotoBack,
  fn: (view) => {
    switch (view) {
      case View.SET_PASSWORD:
        return View.SEED_CONFIRM;
      case View.SEND_CONFIRM:
        return View.SEND_FORM;
      case View.SEED_CONFIRM:
        return View.SEED_WRITE;
      case View.RESTORE:
      case View.SEED_WARNING:
      case View.SEED_WRITE:
        return View.LOGIN;
      default:
        return View.WALLET;
    }
  },
  target: setView,
});
