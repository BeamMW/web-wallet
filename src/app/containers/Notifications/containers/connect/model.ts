import { createEvent, restore } from 'effector';

export const setName = createEvent<string>();

export const $name = restore(setName, '');
