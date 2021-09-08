import { createEvent, restore } from 'effector';

export const setSeed = createEvent<string[]>();
export const setOnboarding = createEvent<boolean>();

export const $seed = restore(setSeed, null);
export const $onboarding = restore(setOnboarding, null);
