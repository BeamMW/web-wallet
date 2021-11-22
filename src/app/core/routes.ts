import {
  Login,
  Restore,
  SetPassword,
  Progress,
  SeedWarning,
  SeedWrite,
  SeedConfirm,
} from '@app/containers/Auth/containers';

import { Connect, ApproveInvoke } from '@app/containers/Notifications/containers';

import { View } from '@app/model/view';
import Wallet from '@app/containers/Wallet/containers/Wallet';
import { SendForm, Settings, SettingsReport } from '@app/containers';
import Receive from '@app/containers/Wallet/containers/Receive';
import SendConfirm from '@app/containers/Wallet/containers/Send/SendConfirm';
import Utxo from '@app/containers/Wallet/containers/Utxo';

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
