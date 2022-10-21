import React from 'react';
import { useRoutes } from 'react-router-dom';

import { ROUTES_PATH } from '@app/shared/constants';
import { Wallet, SendForm, Receive, Utxo } from '..';

const routes = [
  {
    path: ROUTES_PATH.WALLET.BASE,
    element: <Wallet />,
    exact: true,
  },
  {
    path: ROUTES_PATH.WALLET.SEND,
    element: <SendForm />,
  },
  {
    path: ROUTES_PATH.WALLET.RECEIVE,
    element: <Receive />,
  },
  {
    path: ROUTES_PATH.WALLET.UTXO,
    element: <Utxo />,
  },
];

const WalletContainer = () => {
  const content = useRoutes(routes);

  return <>{content}</>;
};

export default WalletContainer;
