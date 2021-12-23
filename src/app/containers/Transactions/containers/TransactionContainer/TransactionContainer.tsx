import React from 'react';
import { useRoutes } from 'react-router-dom';
import { ROUTES_PATH } from '@app/shared/constants';
import { Transactions } from '../Transactions';

const routes = [
  {
    path: ROUTES_PATH.TRANSACTIONS.BASE,
    element: <Transactions />,
    exact: true,
  },
];

const TransactionContainer = () => {
  const content = useRoutes(routes);

  return <>{content}</>;
};

export default TransactionContainer;
