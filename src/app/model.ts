import { createEvent, restore } from 'effector';

import WasmWallet, { WalletEvent } from '@core/WasmWallet';
import { RPCEvent, RPCMethod } from './core/types';

export const GROTHS_IN_BEAM = 100000000;
export const AMOUNT_MAX = 99999999;
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
  SEND_FORM,
  SEND_CONFIRM,
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

const wallet = WasmWallet.getInstance();

export function sendRequest<T = any, P = unknown>(method: RPCMethod, params?: P): Promise<T> {
  return new Promise((resolve, reject) => {
    const target = wallet.send(method, params);
    console.info(`sending ${method}:${target}`);

    const unwatch = sendWalletEvent
      .filter({
        fn: ({ id }) => id === target,
      })
      .watch(({ result }) => {
        console.info(`received ${method}:${target} with`, result);

        resolve(result);
        unwatch();
      });
  });
}
