import { sample } from 'effector';

import WasmWallet from '@core/WasmWallet';

import {
  RPCEvent,
  RPCMethod,
  WalletStatus,
  SyncProgress,
  AssetsEvent,
  TxsEvent,
} from '@core/types';

import { isNil } from '@core/utils';
import { createAddress, getWalletStatus } from '@core/api';

import { setTotals, $$assets, $$transactions } from '@pages/main/portfolio/model';

import {
  View, setView, $onboarding, setOnboarding, sendWalletEvent,
} from './shared';

import {
  $ready,
  setReady,
  setSyncProgress,
  setLoginPhase,
  LoginPhase,
} from './intro';

const wallet = WasmWallet.getInstance();

function handleSyncProgress(
  ready: boolean,
  {
    sync_requests_done,
    sync_requests_total,
    current_state_hash,
    tip_state_hash,
  }: SyncProgress,
) {
  if (!ready && current_state_hash === tip_state_hash) {
    setReady(true);
    setView(View.PORTFOLIO);
    getWalletStatus();
    createAddress();
  } else {
    setSyncProgress([sync_requests_done, sync_requests_total]);
  }
}

sample({
  source: $ready,
  clock: sendWalletEvent,
  fn: (ready, { id, result }) => {
    switch (id) {
      case RPCEvent.SYNC_PROGRESS:
        handleSyncProgress(ready, result);
        break;
      case RPCEvent.SYSTEM_STATE:
        getWalletStatus();
        break;
      case RPCMethod.GetWalletStatus: {
        const { totals } = result as WalletStatus;
        setTotals(totals);
        break;
      }
      case RPCEvent.ASSETS_CHANGED:
        $$assets.push(result as AssetsEvent);
        break;
      case RPCEvent.TXS_CHANGED:
        $$transactions.push(result as TxsEvent);
        break;
      case RPCMethod.CreateAddress:
        break;
      default:
        break;
    }
  },
});

const unwatch = $onboarding.watch((value) => {
  if (!isNil(value)) {
    unwatch();
    setLoginPhase(value ? LoginPhase.FIRSTTIME : LoginPhase.ACTIVE);
  }
});

export default async function initWallet() {
  wallet.init(sendWalletEvent);
  try {
    const result = await wallet.checkWallet();
    setOnboarding(!result);
  } catch {
    setOnboarding(true);
  }
}
