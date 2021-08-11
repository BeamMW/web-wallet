import React, { useEffect } from 'react';
import { useStore } from 'effector-react';
import { css } from '@linaria/core';

import { Login, Restore, Create, SetPassword, Progress } from '@pages/intro';
import { Portfolio, Send } from '@pages/main';
import { $view, View } from '@state/shared';
import { initWallet } from '@state/init';

const ViewCompomentMap = {
  [View.LOGIN]: Login,
  [View.RESTORE]: Restore,
  [View.CREATE]: Create,
  [View.SET_PASSWORD]: SetPassword,
  [View.PROGRESS]: Progress,
  [View.PORTFOLIO]: Portfolio,
  [View.SEND]: Send,
};

css`
  :global() {
    * {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      padding: 0;
    }
  }
`;

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
