import * as React from 'react';
import * as ReactDOM from 'react-dom';

import 'babel-polyfill';

import App from './app';

window.global = window;

export async function initApp(background, windowType){
  ReactDOM.render(<App background={background} windowType={windowType} />, document.getElementById('root'));
}