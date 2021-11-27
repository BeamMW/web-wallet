import { SyncProgress } from './SyncProgress';

export interface AuthStateType {
  is_wallet_synced: boolean;
  sync_progress: SyncProgress;
  seed_values: (string | null)[];
  seed_errors: (boolean | null)[];
  seed_result: string | null;
}
