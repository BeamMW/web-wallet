import { createEvent, createStore } from 'effector';

export enum View {
  LOGIN,
  RESTORE,
  SET_PASSWORD,
  MAIN,
}

export const setView = createEvent<View>();

export const $view = createStore(View.LOGIN).on(
  setView,
  (state, payload) => payload,
);

export const setSeed = createEvent<string[]>();

export const $seed = createStore<string[]>(null).on(
  setSeed,
  (state, payload) => payload,
);
