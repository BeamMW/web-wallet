export enum RPCMethod {
  ToggleSubscribeTo = 'ev_subunsub',
  GetUTXO = 'get_utxo',
  GetAssetInfo = 'get_asset_info',
  GetWalletStatus = 'wallet_status',
  GetAddressList = 'addr_list',
  CreateAddress = 'create_address',
  CalculateChange = 'calc_change',
  ValidateAddress = 'validate_address',
  GetTXList = 'tx_list',
  SendTransaction = 'tx_send',
}

export enum RPCEvent {
  SYNC_PROGRESS = 'ev_sync_progress',
  ASSETS_CHANGED = 'ev_assets_changed',
  SYSTEM_STATE = 'ev_system_state',
  TXS_CHANGED = 'ev_txs_changed',
}
export interface ToggleSubscribeToParams {
  ev_sync_progress?: boolean;
  ev_system_state?: boolean;
  ev_assets_changed?: boolean;
  ev_addrs_changed?: boolean;
  ev_utxos_changed?: boolean;
  ev_txs_changed?: boolean;
}

// data

export interface SyncHash {
  is_in_sync: boolean;
  prev_state_hash: string;
  current_height: number;
  current_state_hash: string;
  current_state_timestamp: number;
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

export interface ChangeData {
  asset_change: number;
  asset_change_str: string;
  change: number;
  change_str: string;
  explicit_fee: number;
}

export enum TransactionType {
  regular = 'Regular',
  maxPrivacy = 'Max Privacy',
  offline = 'Offline',
}
export interface AddressValidation {
  is_mine: boolean;
  is_valid: boolean;
  type: TransactionType;
}

export interface SyncProgress extends SyncHash {
  sync_requests_done: number;
  sync_requests_total: number;
  tip_height: number;
  tip_prev_state_hash: string;
  tip_state_hash: string;
  tip_state_timestamp: number;
}

export interface WalletStatus extends SyncHash {
  available: number;
  difficulty: number;
  maturing: number;
  receiving: number;
  totals: WalletTotal[];
}

// events

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

export interface WalletChangeEvent {
  change: number;
  change_str: string;
}
export interface AssetsEvent extends WalletChangeEvent {
  assets: Asset[];
}

export interface TxsEvent extends WalletChangeEvent {
  txs: Transaction[];
}
