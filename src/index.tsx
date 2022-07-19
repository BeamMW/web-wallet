import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import 'babel-polyfill';

import configureStore from '@app/store/store';
import App from './app';

const { store } = configureStore();

window.global = window;

export default store;

ReactDOM.render(
  <MemoryRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </MemoryRouter>,
  document.getElementById('root'),
);
