import React from 'react';
import { useStore } from 'effector-react';
import { css } from '@linaria/core';
import { Scrollbars } from 'react-custom-scrollbars';

import { $view } from '@app/model/view';

import ROUTES from './core/routes';
import ErrorBoundary from './core/ErrorBoundary';

import './styles';

const trackStyle = css`
  z-index: 999;
  border-radius: 3px;
  background-color: rgba(255,255,255,0.2);
`;

const App = () => {
  const view = useStore($view);
  const ViewComponent = ROUTES[view];

  return (
    <ErrorBoundary>
      <Scrollbars
        style={{ width: 375, height: 600 }}
        renderThumbVertical={(props) => <div {...props} className={trackStyle} />}
      >
        <ViewComponent />
      </Scrollbars>
    </ErrorBoundary>
  );
};

export default App;
