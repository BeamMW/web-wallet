import { SharedStateType } from '@app/shared/interface/SharedStateType';
import { AuthStateType } from '@app/containers/Auth/interfaces';

export interface AppState {
  shared: SharedStateType;
  auth: AuthStateType;
}
