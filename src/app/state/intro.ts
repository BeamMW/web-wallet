import { createEvent, restore } from 'effector';

import { WalletEvent } from '@wallet';

export enum LoginPhase {
  LOADING,
  ACTIVE,
  RESTORE,
  FIRSTTIME,
}

export const setSeed = createEvent<string[]>();
export const setReady = createEvent<boolean>();
export const setSyncProgress = createEvent<[number, number]>();

export const sendWalletEvent = createEvent<WalletEvent>();

export const $seed = restore(setSeed, null);
export const $ready = restore(setReady, false);
export const $syncProgress = restore(setSyncProgress, [0, 0]);

export const $syncPercent = $syncProgress.map<number>((state, last) => {
  const [done, total] = state;
  const next = done === 0 ? 0 : Math.floor((done / total) * 100);
  if (last >= next) {
    return last;
  }
  return next;
});

export const setLoginPhase = createEvent<LoginPhase>();

export const $phase = restore(setLoginPhase, LoginPhase.LOADING);
