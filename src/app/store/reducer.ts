import { AnyAction, combineReducers } from 'redux';
import { AppState } from '@app/shared/interface';
import { SharedReducer } from '@app/shared/store/reducer';
import { AuthReducer } from '@app/containers/Auth/store/reducer';

export default () => {
  const appReducer = combineReducers({
    shared: SharedReducer,
    auth: AuthReducer,
  });

  return (state: AppState | undefined, action: AnyAction) => appReducer(state, action);
};
