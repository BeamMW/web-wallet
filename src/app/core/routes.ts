import {
  Login,
  Restore,
  SetPassword,
  Progress,
  SeedWarning,
  SeedWrite,
  SeedConfirm,
} from '@pages/intro';

import {
  Wallet,
  Receive,
  SendConfirm,
  SendForm,
  Utxo,
  Settings,
  SettingsReport,
} from '@pages/main';

import {
  Connect,
  ApproveInvoke,
} from '@pages/notifications';

import { View } from '@app/model/view';

const ROUTES = {
  [View.LOGIN]: Login,
  [View.RESTORE]: Restore,
  [View.SEED_WARNING]: SeedWarning,
  [View.SEED_WRITE]: SeedWrite,
  [View.SEED_CONFIRM]: SeedConfirm,
  [View.SET_PASSWORD]: SetPassword,
  [View.PROGRESS]: Progress,
  [View.WALLET]: Wallet,
  [View.SEND_FORM]: SendForm,
  [View.SEND_CONFIRM]: SendConfirm,
  [View.RECEIVE]: Receive,
  [View.UTXO]: Utxo,
  [View.SETTINGS]: Settings,
  [View.SETTINGS_REPORT]: SettingsReport,
  [View.CONNECT]: Connect,
  [View.APPROVEINVOKE]: ApproveInvoke,
};

export default ROUTES;
