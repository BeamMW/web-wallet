import { SyncProgress, DatabaseSyncProgress, SyncStep } from './SyncProgress';

export interface AuthStateType {
  is_wallet_synced: boolean;
  sync_step: SyncStep;
  sync_progress: SyncProgress;
  database_sync_progress: DatabaseSyncProgress;
  download_db_progress: DatabaseSyncProgress;
  seed_values: (string | null)[];
  seed_errors: (boolean | null)[];
  seed_result: string | null;
  registration_seed: string;
  is_restore: boolean;
  seed_ids: number[];
}
