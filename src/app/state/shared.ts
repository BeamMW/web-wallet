import { createEvent, restore } from 'effector';

export const GROTHS_IN_BEAM = 100000000;
export const FEE_DEFAULT = 100000;

export enum ErrorMessage {
  INVALID = 'Invalid password provided',
  EMPTY = 'Please, enter password',
}

export enum View {
  // intro
  LOGIN,
  CREATE,
  RESTORE,
  SET_PASSWORD,
  PROGRESS,
  // main
  PORTFOLIO,
  SEND,
  UTXO,
}

export const setView = createEvent<View>();
export const $view = restore(setView, View.LOGIN);

export const setOnboarding = createEvent<boolean>();
export const $onboarding = restore(setOnboarding, null);
