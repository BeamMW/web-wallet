import { createSelector } from 'reselect';

import { AppState } from '../interface';

const selectShared = (state: AppState) => state.shared;

export const selectRouterLink = () => createSelector(selectShared, (state) => state.routerLink);
export const selectErrorMessage = () => createSelector(selectShared, (state) => state.errorMessage);
