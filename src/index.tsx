/// <reference types="chrome"/>

import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import store from '@app/store/rootStore';
import { initLockState } from '@core/lockState';
import { setLockState } from '@app/shared/store/actions';
import App from './app';

window.global = window;

export default store;

const ReduxProvider = Provider as unknown as React.ComponentType<any>;

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Root element (#root) not found');
}

const render = () => createRoot(rootEl).render(
  <MemoryRouter>
    <ReduxProvider store={store}>
      <App />
    </ReduxProvider>
  </MemoryRouter>,
);

// Resolve the lock flag from chrome.storage.session before the first render, so the
// router never routes off a stale value.
initLockState()
  .then((locked) => {
    store.dispatch(setLockState(locked));
    render();
  })
  .catch(() => render());
