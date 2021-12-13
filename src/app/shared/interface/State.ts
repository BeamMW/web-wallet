import { SharedStateType } from '@app/shared/interface/SharedStateType';
import { AuthStateType } from '@app/containers/Auth/interfaces';
import { SettingsStateType } from '@app/containers/Settings/interfaces';
import { WalletStateType } from '@app/containers/Wallet/interfaces';

export interface AppState {
  shared: SharedStateType;
  auth: AuthStateType;
  settings: SettingsStateType;
  wallet: WalletStateType;
}
