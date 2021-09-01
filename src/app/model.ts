import { createEvent, restore } from 'effector';

import { WalletEvent } from '@core/WasmWallet';
import { RPCEvent, RPCMethod } from './core/types';

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

export const setSeed = createEvent<string[]>();
export const setView = createEvent<View>();
export const setOnboarding = createEvent<boolean>();

export const $seed = restore(setSeed, null);
export const $view = restore(setView, View.LOGIN);
export const $onboarding = restore(setOnboarding, null);

export const sendWalletEvent = createEvent<WalletEvent>();

export function handleWalletEvent<E>(event: RPCEvent | RPCMethod, handler: (payload: E) => void) {
  sendWalletEvent.filterMap(({ id, result }) => (
    id === event ? result as E : undefined
  ))
    .watch(handler);
}
