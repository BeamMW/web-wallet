import { createEffect, restore } from 'effector';

export const GROTHS_IN_BEAM = 100000000;
export const AMOUNT_MAX = 99999999;
export const FEE_DEFAULT = 100000;

const FETCH_INTERVAL = 310000;

const API_URL = 'https://api.coingecko.com/api/v3/simple/price';
const RATE_PARAMS = 'ids=beam&vs_currencies=usd';

interface RateResponse {
  beam: {
    usd: number;
  };
}

export const getRateFx = createEffect(async () => {
  const response = await fetch(`${API_URL}?${RATE_PARAMS}`);
  const promise: Promise<RateResponse> = response.json();
  return promise;
});

export const $rate = restore(
  getRateFx.doneData.map((data) => data.beam.usd), null,
);

getRateFx.doneData.watch(() => setTimeout(getRateFx, FETCH_INTERVAL));
