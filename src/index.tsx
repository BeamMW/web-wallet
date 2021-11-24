import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import 'babel-polyfill';
import { initRemoteWallet } from '@core/api';


const { store } = configureStore();

import App from './app';
import configureStore from "@app/store/store";

window.global = window;

export default store;

initRemoteWallet();

ReactDOM.render(
    <MemoryRouter>
        <Provider store={store}>
            <App />
        </Provider>
    </MemoryRouter>
    , document.getElementById('root'));
