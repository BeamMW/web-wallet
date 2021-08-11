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

import { View, setView, $onboarding, setOnboarding } from './shared';
import { setTotals, setMeta, setTransactions } from './portfolio';

import {
  $ready,
  setReady,
  setSyncProgress,
  sendWalletEvent,
  setLoginPhase,
  LoginPhase,
} from './intro';

const wallet = WasmWallet.getInstance();

export async function initWallet() {
  wallet.init(sendWalletEvent);

  try {
    const result = await wallet.loadWallet();
    setOnboarding(isNil(result));
  } catch {
    setOnboarding(false);
  }
}

function handleSyncProgress(
  ready: boolean,
  { done, total, current_state_hash, tip_state_hash }: SyncProgress,
) {
  if (!ready && current_state_hash === tip_state_hash) {
    setReady(true);
    setView(View.PORTFOLIO);
    getWalletStatus();
    createAddress();
  } else {
    setSyncProgress([done, total]);
  }
}

function handleWalletStatus({ totals }: WalletStatus) {
  setTotals(totals);
}

function handleAssetsChanged({ change, assets }: AssetsEvent) {
  switch (change) {
    case 3: // reset
      setMeta(assets);
      break;
    default:
  }
}

function handleTxsChanged({ change, txs }: TxsEvent) {
  switch (change) {
    case 3: // reset
      setTransactions(txs);
      break;
    default:
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
      case RPCEvent.ASSETS_CHANGED:
        handleAssetsChanged(result);
        break;
      case RPCEvent.SYSTEM_STATE:
        getWalletStatus();
        break;
      case RPCEvent.TXS_CHANGED:
        handleTxsChanged(result);
        break;
      case RPCMethod.GetWalletStatus:
        handleWalletStatus(result);
        break;
      case RPCMethod.CreateAddress:
        break;
      default:
        break;
    }
  },
});

let unwatch;

unwatch = $onboarding.watch(value => {
  if (!isNil(value)) {
    unwatch();
    setLoginPhase(value ? LoginPhase.FIRSTTIME : LoginPhase.ACTIVE);
  }
});
