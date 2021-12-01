import { createSelector } from 'reselect';
import { AppState } from '../../../shared/interface';

const selectSettings = (state: AppState) => state.settings;

export const selectLogs = () => createSelector(selectSettings, (state) => state.logs);
export const selectVersion = () => createSelector(selectSettings, (state) => state.version);
