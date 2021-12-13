import React, { useEffect } from 'react';

import { css } from '@linaria/core';
import { Scrollbars } from 'react-custom-scrollbars';

import './styles';

import { ROUTES } from '@app/shared/constants';
import { actions as sharedActions, selectors as sharedSelectors } from '@app/shared/store';

import { useNavigate, useRoutes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ErrorBoundary } from '@app/shared/components';
import { WalletContainer } from './containers/Wallet';
import { AuthContainer, Progress } from './containers/Auth';
import { SettingsContainer } from './containers/Settings';
import { NotificationContainer } from './containers/Notifications';

const trackStyle = css`
  z-index: 999;
  border-radius: 3px;
  background-color: rgba(255, 255, 255, 0.2);
`;

const routes = [
  {
    path: '/',
    element: <Progress />,
  },
  {
    path: `${ROUTES.AUTH.BASE}/*`,
    element: <AuthContainer />,
  },
  {
    path: `${ROUTES.NOTIFICATIONS.BASE}/*`,
    element: <NotificationContainer />,
  },
  {
    path: `${ROUTES.NOTIFICATIONS.BASE}/*`,
    element: <NotificationContainer />,
  },
  {
    path: `${ROUTES.SETTINGS.BASE}/*`,
    element: <SettingsContainer />,
  },
  {
    path: `${ROUTES.WALLET.BASE}/*`,
    element: <WalletContainer />,
  },
];

const App = () => {
  const dispatch = useDispatch();
  const content = useRoutes(routes);
  const navigate = useNavigate();
  const navigateURL = useSelector(sharedSelectors.selectRouterLink());

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
      </Scrollbars>
    </ErrorBoundary>
  );
};

export default App;
