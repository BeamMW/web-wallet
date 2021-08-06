import React, { useEffect } from 'react';
import { useStore } from 'effector-react';

import Login from '@intro/login';
import Restore from '@intro/restore';
import Create from '@intro/create';
import SetPassword from '@intro/set-password';
import Progress from '@intro/progress';
import Portfolio from '@main/portfolio';

import { initWallet, $view, View } from './model';

const ViewCompomentMap = {
  [View.LOGIN]: Login,
  [View.RESTORE]: Restore,
  [View.CREATE]: Create,
  [View.SET_PASSWORD]: SetPassword,
  [View.PROGRESS]: Progress,
  [View.PORTFOLIO]: Portfolio,
};

const App = () => {
  useEffect(() => {
    initWallet();
  }, []);

  const view = useStore($view);
  const ViewComponent = ViewCompomentMap[view];

  return (
    <div>
      <ViewComponent />
    </div>
  );
};

export default App;
