import { createEffect, createEvent, restore } from 'effector';

import { generateSeed } from '@core/api';

export const setIds = createEvent<number[]>();

export const $ids = restore(setIds, []);

const SEED_CONFIRM_COUNT = 6;

const getRandomIds = () => {
  const result = [];
  while (result.length < SEED_CONFIRM_COUNT) {
    const value = Math.floor(Math.random() * 12);
    if (!result.includes(value)) {
      result.push(value);
    }
  }
  return result;
};

type Seed = [string, boolean];

export const setSeed = createEvent<Seed>();

export const generateSeedFx = createEffect(generateSeed);

export const $seed = restore(setSeed, ['', false] as Seed);
export const $words = $seed.map(([seed]) => seed.split(' '));

$seed.reset(generateSeedFx);
$seed.on(generateSeedFx.doneData, (state, payload) => [payload, false]);

$ids.on(generateSeedFx.doneData, () => getRandomIds());
