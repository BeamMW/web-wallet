import { SyncProgress } from './SyncProgress';

export interface AuthStateType {
  is_wallet_synced: boolean;
  sync_progress: SyncProgress;
}
