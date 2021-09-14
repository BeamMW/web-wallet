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
  sending_str: string;
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

export enum TxStatusString {
  IN_PROGRESS = 'in progress',
  RECEIVING = 'receiving',
  SENDING = 'sending',
  PENDING = 'pending',
  WAITING_FOR_RECEIVER = 'waiting for receiver',
  WAITING_FOR_SENDER = 'waiting for sender',
  SENT = 'sent',
  RECEIVED = 'received',
  CANCELED = 'cancelled',
  EXPIRED = 'expired',
  FAILED = 'failed',
  COMPLETED = 'completed',
  SELF_SENDING = 'self sending',
  SENT_TO_OWN_ADDRESS = 'sent to own address',

  SENT_OFFLINE = 'sent offline',
  RECEIVED_OFFLINE = 'received offline',
  CANCELED_OFFLINE = 'canceled offline',
  IN_PROGRESS_OFFLINE = 'in progress offline',
  FAILED_OFFLINE = 'failed offline',

  SENT_MAX_PRIVACY = 'sent max privacy',
  RECEIVED_MAX_PRIVACY = 'received max privacy',
  CANCELED_MAX_PRIVACY = 'canceled max privacy',
  IN_PROGRESS_MAX_PRIVACY = 'in progress max privacy',
  FAILED_MAX_PRIVACY = 'failed max privacy',

  IN_PROGRESS_PUBLIC_OFFLINE = 'in progress public offline',
  FAILED_PUBLIC_OFFLINE = 'failed public offline',
  SENT_PUBLIC_OFFLINE = 'sent public offline',
  CANCELED_PUBLIC_OFFLINE = 'canceled public offline',
  RECEIVED_PUBLIC_OFFLINE = 'received public offline',
}

export enum TxStatus {
  PENDING,
  IN_PROGRESS,
  CANCELED,
  COMPLETED,
  FAILED,
  REGISTERING,
}

export enum TxType {
  SIMPLE = 0,
  ASSET_ISSUE = 2,
  ASSET_CONSUME = 3,
  ASSET_INFO = 6,
  PUSH_TX = 7,
  CONTRACT = 12,
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
  status: TxStatus;
  status_string: TxStatusString;
  txId: string;
  tx_type: TxType;
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

export enum EnvironmentType {
  POPUP = 'popup',
  NOTIFICATION = 'notification',
  FULLSCREEN = 'fullscreen',
  BACKGROUND = 'background'
}
