import React, { useEffect } from 'react';

import { css } from '@linaria/core';
import { Scrollbars } from 'react-custom-scrollbars';

import './styles';

import { Connect, ApproveInvoke } from '@app/containers/Notifications/containers';

import { ROUTES } from '@app/shared/constants';
import { actions as sharedActions, selectors as sharedSelectors } from '@app/shared/store';

import { useNavigate, useRoutes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Wallet from '@app/containers/Wallet/containers/wallet';
import LoginActive from '@app/containers/Auth/containers/login/LoginActive';
import {
  SendConfirm,
  SendForm,
  Settings,
  SettingsReport,
  Restore,
  SetPassword,
  Progress,
  SeedWarning,
  SeedWrite,
  SeedConfirm,
} from '@app/containers';
import Receive from '@app/containers/Wallet/containers/receive';
import Utxo from '@app/containers/Wallet/containers/utxo';
import ErrorBoundary from './core/ErrorBoundary';

const trackStyle = css`
  z-index: 999;
  border-radius: 3px;
  background-color: rgba(255, 255, 255, 0.2);
`;

const routes = [
  {
    path: '/',
    element: <Wallet />,
  },
  {
    path: ROUTES.AUTH.LOGIN,
    element: <LoginActive />,
  },
  {
    path: ROUTES.AUTH.RESTORE,
    element: <Restore />,
  },
  {
    path: ROUTES.AUTH.SEED_WARNING,
    element: <SeedWarning />,
  },
  {
    path: ROUTES.AUTH.SEED_CONFIRM,
    element: <SeedConfirm />,
  },
  {
    path: ROUTES.AUTH.SEED_WRITE,
    element: <SeedWrite />,
  },
  {
    path: ROUTES.AUTH.PROGRESS,
    element: <Progress />,
  },
  {
    path: ROUTES.AUTH.SET_PASSWORD,
    element: <SetPassword />,
  },
  {
    path: ROUTES.NOTIFICATIONS.CONNECT,
    element: <Connect />,
  },
  {
    path: ROUTES.NOTIFICATIONS.APPROVE_INVOKE,
    element: <ApproveInvoke />,
  },

  {
    path: ROUTES.WALLET.BASE,
    element: <Wallet />,
  },
  {
    path: ROUTES.WALLET.SEND,
    element: <SendForm />,
  },
  {
    path: ROUTES.WALLET.SEND_CONFIRM,
    element: <SendConfirm />,
  },
  {
    path: ROUTES.WALLET.RECEIVE,
    element: <Receive />,
  },
  {
    path: ROUTES.SETTINGS.BASE,
    element: <Settings />,
  },
  {
    path: ROUTES.SETTINGS.SETTINGS_REPORT,
    element: <SettingsReport />,
  },
  {
    path: ROUTES.WALLET.UTXO,
    element: <Utxo />,
  },
];

const App = () => {
  const dispatch = useDispatch();
  const content = useRoutes(routes);
  const navigate = useNavigate();
  const navigateURL = useSelector(sharedSelectors.getRouterLink());

  useEffect(() => {
    if (navigateURL) {
      navigate(navigateURL);
      dispatch(sharedActions.navigate(''));
    }
  }, [navigateURL, dispatch, navigate]);

  return (
    <ErrorBoundary>
      <Scrollbars
        style={{ width: 375, height: 600 }}
        renderThumbVertical={(props) => <div {...props} className={trackStyle} />}
      >
        {content}

        {/* <ViewComponent /> */}
      </Scrollbars>
    </ErrorBoundary>
  );
};

export default App;
