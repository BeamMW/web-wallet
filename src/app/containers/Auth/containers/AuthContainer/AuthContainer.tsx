import React from 'react';
import { useRoutes } from 'react-router-dom';

import { ROUTES_PATH } from '@app/shared/constants';
import LoginActive from '@app/containers/Auth/containers/login/LoginActive';
import Restore from '@app/containers/Auth/containers/restore';
import Progress from '@app/containers/Auth/containers/progress';
import SetPassword from '@app/containers/Auth/containers/set-password';
import { SeedWarning, SeedConfirm, SeedWrite } from '@app/containers/Auth/containers/create/';

const routes = [
  {
    path: ROUTES_PATH.AUTH.LOGIN,
    element: <LoginActive />,
  },
  {
    path: ROUTES_PATH.AUTH.RESTORE,
    element: <Restore />,
  },
  {
    path: ROUTES_PATH.AUTH.SEED_WARNING,
    element: <SeedWarning />,
  },
  {
    path: ROUTES_PATH.AUTH.SEED_CONFIRM,
    element: <SeedConfirm />,
  },
  {
    path: ROUTES_PATH.AUTH.SEED_WRITE,
    element: <SeedWrite />,
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
