/// <reference types="chrome"/>

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import 'babel-polyfill';

import configureStore from '@app/store/store';
import App from './app';
import { initRemoteConnection } from '@app/core/api';

const { store } = configureStore();

window.global = window;

export default store;

initRemoteConnection();

ReactDOM.render(
  <MemoryRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </MemoryRouter>,
  document.getElementById('root'),
);
