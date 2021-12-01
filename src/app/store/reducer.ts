import { AnyAction, combineReducers } from 'redux';
import { AppState } from '@app/shared/interface';
import { SharedReducer } from '@app/shared/store/reducer';
import { AuthReducer } from '@app/containers/Auth/store/reducer';
import { SettingsReducer } from '@app/containers/Settings/store/reducer';

export default () => {
  const appReducer = combineReducers({
    shared: SharedReducer,
    auth: AuthReducer,
    settings: SettingsReducer,
  });

  return (state: AppState | undefined, action: AnyAction) => appReducer(state, action);
};
