import React, { useEffect } from 'react';

import { Login, Restore, Create, SetPassword, Progress } from '@pages/intro';
import { Portfolio, Send } from '@pages/main';
import { $view, View } from '@state/shared';

const ROUTES = {
  [View.LOGIN]: Login,
  [View.RESTORE]: Restore,
  [View.CREATE]: Create,
  [View.SET_PASSWORD]: SetPassword,
  [View.PROGRESS]: Progress,
  [View.PORTFOLIO]: Portfolio,
  [View.SEND]: Send,
};

export const getCurrentView = (view: View) => {
  return ROUTES[view];
};
