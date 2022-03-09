import React from 'react';
import { useRoutes } from 'react-router-dom';
import { ROUTES_PATH } from '@app/shared/constants';
import { AssetsList } from '../AssetsList';
import { AssetDetail } from '../AssetDetail';
import { AssetInfo } from '../AssetInfo';

const routes = [
  {
    path: ROUTES_PATH.ASSETS.BASE,
    element: <AssetsList />,
    exact: true,
  },
  {
    path: ROUTES_PATH.ASSETS.DETAIL,
    element: <AssetDetail />,
    exact: true,
  },
  {
    path: ROUTES_PATH.ASSETS.INFO,
    element: <AssetInfo />,
    exact: true,
  },
];

const AssetContainer = () => {
  const content = useRoutes(routes);

  return <>{content}</>;
};

export default AssetContainer;
