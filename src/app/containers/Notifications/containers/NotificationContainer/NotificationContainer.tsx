import React from 'react';
import { useRoutes } from 'react-router-dom';

import { ROUTES_PATH } from '@app/shared/constants';
import { ApproveInvoke, ApproveSend, Connect } from '..';

const routes = [
  {
    path: ROUTES_PATH.NOTIFICATIONS.APPROVE_INVOKE,
    element: <ApproveInvoke />,
  },
  {
    path: ROUTES_PATH.NOTIFICATIONS.APPROVE_SEND,
    element: <ApproveSend />,
  },
  {
    path: ROUTES_PATH.NOTIFICATIONS.CONNECT,
    element: <Connect />,
  },
];

const NotificationContainer = () => {
  const content = useRoutes(routes);

  return <>{content}</>;
};

export default NotificationContainer;
