import { AnyAction, combineReducers } from 'redux';
import { AppState } from '@app/shared/interface';
import { SharedReducer } from '@app/shared/store/reducer';

export default () => {
  const appReducer = combineReducers({
    shared: SharedReducer,
  });

  return (state: AppState | undefined, action: AnyAction) => appReducer(state, action);
};
