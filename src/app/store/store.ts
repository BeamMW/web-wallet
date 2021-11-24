import { createStore, applyMiddleware, compose, Middleware } from "redux";

import { composeWithDevTools } from "redux-devtools-extension";
import createSagaMiddleware from "redux-saga";


import appSagas from "./saga";
import rootReducer from "./reducer";


const sagaMiddleware = createSagaMiddleware();
let middleware: Array<Middleware>;
// eslint-disable-next-line @typescript-eslint/ban-types
let composer: Function;

if (process.env.NODE_ENV !== "development") {
    middleware = [sagaMiddleware];
    composer = composeWithDevTools({ trace: true, traceLimit: 25 });
} else {
    middleware = [sagaMiddleware];
    composer = compose;
}



export default function configureStore() {
    const store = createStore(
        rootReducer(),
        undefined,
        composer(applyMiddleware(...middleware)),
    );

    sagaMiddleware.run(appSagas);

    // eslint-disable-next-line
    if ((module as any).hot) {
        // eslint-disable-next-line
        (module as any).hot.accept(() => store.replaceReducer(rootReducer()));
    }

    return { store };
}
