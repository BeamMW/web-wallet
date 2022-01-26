import {
  createStore, applyMiddleware, compose, Middleware, MiddlewareAPI, Dispatch,
} from 'redux';

import createSagaMiddleware from 'redux-saga';

import appSagas from './saga';
import rootReducer from './reducer';

const sagaMiddleware = createSagaMiddleware();
let middleware: Array<Middleware>;
// eslint-disable-next-line @typescript-eslint/ban-types
let composer: Function;

if (process.env.NODE_ENV === 'development') {
  const debuggerMiddleware: Middleware = (store: MiddlewareAPI) => (next: Dispatch) => (action) => {
    const beforeChanges = { ...store.getState() };
    // eslint-disable-next-line no-console
    console.log('%c beforeChanges:::', 'color:#6b5b95;font-weight:bold;font-size:12px;', beforeChanges);
    // eslint-disable-next-line no-console
    console.log();
    // eslint-disable-next-line no-console
    console.log(
      `%c action:::${new Date()}`,
      'color:#eca1a6;font-weight:bold;font-size:12px;',
      action.type,
      action.payload,
    );
    // eslint-disable-next-line no-console
    console.log();
    next(action);
    // eslint-disable-next-line no-console
    console.log('%c currentState:::', 'color:#feb236;font-weight:bold;font-size:12px;', { ...store.getState() });
    // eslint-disable-next-line no-console
    console.log('________________');
  };
  middleware = [sagaMiddleware, debuggerMiddleware];
  composer = compose;
} else {
  middleware = [sagaMiddleware];
  composer = compose;
}

export default function configureStore() {
  const store = createStore(rootReducer(), undefined, composer(applyMiddleware(...middleware)));

  sagaMiddleware.run(appSagas);

  // eslint-disable-next-line
  if ((module as any).hot) {
    // eslint-disable-next-line
    (module as any).hot.accept(() => store.replaceReducer(rootReducer()));
  }

  return { store };
}
