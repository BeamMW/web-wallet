import { createAction } from 'typesafe-actions';
import { AuthActionTypes } from './constants';

export const setOnBoarding = createAction(AuthActionTypes.SET_ON_BOARDING)<boolean>();
