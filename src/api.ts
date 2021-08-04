export enum RPCMethod {
  ToggleSubscribeTo = 'ev_subunsub',
}

export enum RPCEvent {
  SYNC_PROGRESS = 'ev_sync_progress',
}

export interface ToggleSubscribeToParams {
  ev_sync_progress?: boolean;
  ev_system_state?: boolean;
  ev_assets_changed?: boolean;
  ev_addrs_changed?: boolean;
  ev_utxos_changed?: boolean;
  ev_txs_changed?: boolean;
}
