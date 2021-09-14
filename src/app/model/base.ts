import { createEvent, restore } from 'effector';

//TODO: any -> string[]
export const setSeed = createEvent<any>();
export const setOnboarding = createEvent<boolean>();

export const $seed = restore(setSeed, null);
export const $onboarding = restore(setOnboarding, null);
