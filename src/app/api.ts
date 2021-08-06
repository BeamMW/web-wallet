import WasmWallet, { RPCMethod } from '@wallet';

interface WalletData {
  is_in_sync: boolean;
  prev_state_hash: string;
  current_height: number;
  current_state_hash: string;
  current_state_timestamp: number;
}
export interface SyncProgressData extends WalletData {
  done: number;
  total: number;
  tip_height: number;
  tip_prev_state_hash: string;
  tip_state_hash: string;
  tip_state_timestamp: number;
}

export interface WalletTotal {
  asset_id: number;
  available: number;
  available_str: string;
  maturing: number;
  maturing_str: string;
  receiving: number;
  receiving_str: string;
  sending: number;
}
export interface WalletStatusData extends WalletData {
  available: number;
  difficulty: number;
  maturing: number;
  receiving: number;
  totals: WalletTotal[];
}

export interface MetadataPairs {
  N: string;
  NTHUN?: string;
  SCH_VER?: string;
  SN: string;
  UN?: string;
}
export interface Asset {
  asset_id: number;
  emission: number;
  emission_str: string;
  isOwned: number;
  lockHeight: number;
  metadata: string;
  metadata_kv: boolean;
  metadata_pairs: MetadataPairs;
  metadata_std: boolean;
  metadata_std_min: boolean;
  ownerId: string;
}

export interface ChangeEvent {
  change: number;
  change_str: string;
}
export interface AssetsEvent extends ChangeEvent {
  assets: Asset[];
}

export interface Transaction {
  asset_id: number;
  comment: string;
  confirmations: number;
  create_time: number;
  fee: number;
  height: number;
  income: boolean;
  kernel: string;
  receiver: string;
  sender: string;
  status: number;
  status_string: string;
  txId: string;
  tx_type: number;
  tx_type_string: string;
  value: number;
}

export interface TxsEvent extends ChangeEvent {
  txs: Transaction[];
}

function sendRequest(method: RPCMethod, params?: any): void {
  WasmWallet.getInstance().send(method, params);
}

export function getWalletStatus() {
  sendRequest(RPCMethod.GetWalletStatus);
}

export function createAddress() {
  sendRequest(RPCMethod.CreateAddress);
}
