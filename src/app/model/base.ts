import { createEvent, restore, sample } from 'effector';
import { $view, setView, View } from './view';

export const setSeed = createEvent<string[]>();
export const setOnboarding = createEvent<boolean>();

export const $seed = restore(setSeed, null);
export const $onboarding = restore(setOnboarding, null);

export const $backButtonShown = $view.map((view) => view !== View.WALLET);

export const onPreviousClick = createEvent<React.SyntheticEvent>();

// go back 1 screen
sample({
  source: $view,
  clock: onPreviousClick,
  fn: (view) => {
    switch (view) {
      case View.SEND_CONFIRM:
        return View.SEND_FORM;
      default:
        return View.WALLET;
    }
  },
  target: setView,
});
