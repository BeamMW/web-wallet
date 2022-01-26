export interface SyncProgress {
  sync_requests_done: number;
  sync_requests_total: number;
}

export interface DatabaseSyncProgress {
  done: number;
  total: number;
}

export enum SyncStep {
  DOWNLOAD = 'download',
  RESTORE = 'restore',
  SYNC = 'sync',
}
