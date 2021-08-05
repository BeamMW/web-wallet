import { createEvent, createStore, restore, sample } from 'effector';

import {
  getAddressList,
  getTXList,
  getUTXO,
  getWalletStatus,
  loadAssetsInfo,
} from '@api';
import WasmWallet, { WalletEvent, RPCEvent, RPCMethod } from '@wallet';

export enum View {
  LOGIN,
  CREATE,
  RESTORE,
  SET_PASSWORD,
  PROGRESS,
  PORTFOLIO,
}

export const setView = createEvent<View>();
export const setSeed = createEvent<string[]>();
export const setReady = createEvent<boolean>();
export const setSyncProgress = createEvent<[number, number]>();

export const sendWalletEvent = createEvent<WalletEvent>();

export const $view = restore(setView, View.LOGIN);
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

sample({
  source: $ready,
  clock: sendWalletEvent,
  fn: (ready, { id, result }) => {
    switch (id) {
      case RPCEvent.SYNC_PROGRESS:
        {
          const { done, total, current_state_hash, tip_state_hash } = result;

          if (!ready && current_state_hash === tip_state_hash) {
            setReady(true);
            setView(View.PORTFOLIO);
            getWalletStatus();
            getAddressList();
            getUTXO();
            getTXList();
          } else {
            setSyncProgress([done, total]);
          }
        }
        break;
      case RPCMethod.GetWalletStatus:
        {
          const { totals } = result;
          if (totals.length > 1) {
            loadAssetsInfo(totals);
          }
        }
        break;
      default:
        break;
    }
  },
});

export const initWallet = () => {
  WasmWallet.getInstance().init(sendWalletEvent);
};
