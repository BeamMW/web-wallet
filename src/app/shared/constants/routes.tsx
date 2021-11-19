export const ROUTES = {
  AUTH: {
    BASE: '/auth',
    LOGIN: '/auth/login',
    RESTORE: '/auth/restore',
    SEED_WARNING: '/auth/seed_warning',
    SEED_WRITE: '/auth/seed_write',
    SEED_CONFIRM: '/auth/seed_confirm',
    SET_PASSWORD: '/auth/set_password',
    PROGRESS: '/auth/progress',
  },
  WALLET: {
    BASE: '/wallet',
    SEND: '/wallet/send',
    SEND_CONFIRM: '/wallet/send_confirm',
    RECEIVE: '/wallet/receive',
    UTXO: '/wallet/utxo',
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    CONNECT: '/notifications/connect',
    APPROVE_INVOKE: '/notifications/approve_invoke',
  },
  SETTINGS: {
    BASE: '/settings',
    SETTINGS_REPORT: '/settings/report',
  },
};

export const ROUTES_PATH = {
  AUTH: {
    AUTH: '/auth',
    LOGIN: '/login',
    RESTORE: '/restore',
    SEED_WARNING: '/seed_warning',
    SEED_WRITE: '/seed_write',
    SEED_CONFIRM: '/seed_confirm',
    SET_PASSWORD: '/set_password',
    PROGRESS: '/progress',
  },
  WALLET: {
    BASE: '/',
    SEND: '/send',
    SEND_CONFIRM: '/send_confirm',
    RECEIVE: '/receive',
    UTXO: '/utxo',
  },
  NOTIFICATIONS: {
    CONNECT: '/connect',
    APPROVE_INVOKE: '/approve_invoke',
  },
  SETTINGS: {
    BASE: '/settings',
    SETTINGS_REPORT: '/report',
  },
};
