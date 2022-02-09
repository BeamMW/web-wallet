import React from 'react';
import { useRoutes } from 'react-router-dom';
import { ROUTES_PATH } from '@app/shared/constants';
import { Assets } from '../Assets';
import { AssetDetail } from '../AssetDetail';

const routes = [
  {
    path: ROUTES_PATH.TRANSACTIONS.BASE,
    element: <Assets />,
    exact: true,
  },
  {
    path: ROUTES_PATH.TRANSACTIONS.DETAIL,
    element: <AssetDetail />,
    exact: true,
  },
];

const AssetContainer = () => {
  const content = useRoutes(routes);

  return <>{content}</>;
};

export default AssetContainer;
