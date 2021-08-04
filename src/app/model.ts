import { createEvent, createStore, restore } from 'effector';

export enum View {
  LOGIN,
  RESTORE,
  SET_PASSWORD,
  PROGRESS,
  MAIN,
}

export const setView = createEvent<View>();
export const setSyncProgress = createEvent<[number, number]>();
export const setSeed = createEvent<string[]>();

export const $seed = restore(setSeed, null);
export const $view = restore(setView, View.LOGIN);
export const $syncProgress = restore(setSyncProgress, [0, 0]);

export const $syncPercent = $syncProgress.map<number>((state, last) => {
  const [done, total] = state;
  const next = done === 0 ? 0 : Math.floor((done / total) * 100);
  if (last >= next) {
    return last;
  }
  return next;
});

$syncProgress.watch(state => {
  const [done, total] = state;
  if (total > 0 && done === total) {
    setView(View.MAIN);
  }
});
