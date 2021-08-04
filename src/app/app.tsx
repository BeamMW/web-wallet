import React, { useEffect } from 'react';
import { useStore } from 'effector-react';

import WasmWallet from '@wallet';

import Login from './login';
import Restore from './restore';
import SetPassword from './set-password';
import Main from './main';

import { $view, View } from './model';

const ViewCompomentMap = {
  [View.LOGIN]: Login,
  [View.RESTORE]: Restore,
  [View.SET_PASSWORD]: SetPassword,
  [View.MAIN]: Main,
};

const App = () => {
  useEffect(() => {
    WasmWallet.getInstance().init();
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
