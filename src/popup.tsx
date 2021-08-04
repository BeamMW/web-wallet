import * as React from 'react';
import * as ReactDOM from 'react-dom';

import App from './app';

window.global = window;

ReactDOM.render(<App />, document.getElementById('root'));
