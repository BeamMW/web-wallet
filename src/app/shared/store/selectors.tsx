import { createSelector } from "reselect";

import { AppState } from "../interface";

const selectShared = (state: AppState) => state.shared;

export const getRouterLink = () => createSelector(selectShared, (state) => state.routerLink);
