import * as React from 'react';
import * as ReactDOM from 'react-dom';

import 'babel-polyfill';

import { initRemoteWallet } from '@core/api';

import App from './app';

window.global = window;

initRemoteWallet();
ReactDOM.render(<App />, document.getElementById('root'));
