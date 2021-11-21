import React from 'react';
import { useRoutes } from 'react-router-dom';

import { ROUTES_PATH } from '@app/shared/constants';
import {
  Login,
  AuthBase,
  Restore,
  Progress,
  Registration,
  RegistrationConfirm,
  SetPassword,
} from '@app/containers/Auth/containers';

const routes = [
  {
    path: '/',
    element: <AuthBase />,
    exact: true,
  },
  {
    path: ROUTES_PATH.AUTH.LOGIN,
    element: <Login />,
  },
  {
    path: ROUTES_PATH.AUTH.RESTORE,
    element: <Restore />,
  },

  {
    path: ROUTES_PATH.AUTH.REGISTRATION_CONFIRM,
    element: <RegistrationConfirm />,
  },
  {
    path: ROUTES_PATH.AUTH.REGISTRATION,
    element: <Registration />,
  },
  {
    path: ROUTES_PATH.AUTH.PROGRESS,
    element: <Progress />,
  },
  {
    path: ROUTES_PATH.AUTH.SET_PASSWORD,
    element: <SetPassword />,
  },
];

const AuthContainer = () => {
  const content = useRoutes(routes);

  return <>{content}</>;
};

export default AuthContainer;
