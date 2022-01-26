import React from 'react';
import { useRoutes } from 'react-router-dom';

import { ROUTES_PATH } from '@app/shared/constants';
import { Settings, SettingsReport, SettingsConnected } from '..';

const routes = [
  {
    path: '/',
    element: <Settings />,
    exact: true,
  },
  {
    path: ROUTES_PATH.SETTINGS.SETTINGS_REPORT,
    element: <SettingsReport />,
  },
  {
    path: ROUTES_PATH.SETTINGS.SETTINGS_CONNECTED,
    element: <SettingsConnected />,
  },
];

const SettingsContainer = () => {
  const content = useRoutes(routes);

  return <>{content}</>;
};

export default SettingsContainer;
