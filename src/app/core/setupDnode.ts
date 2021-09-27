/* eslint-disable no-param-reassign */
import Dnode from 'dnode/browser';
import 'setimmediate';

export function transformMethods(transformation, obj, target = {}) {
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'object') {
      target[key] = {};
      transformMethods(transformation, obj[key], target[key]);
    } else if (typeof obj[key] === 'function') {
      target[key] = transformation(obj[key], obj);
    } else {
      target[key] = obj[key];
    }
  });
  return target;
}

export function promiseToCb(fn, context) {
  return (...args) => {
    const lastArg = args[args.length - 1];
    const lastArgIsCallback = typeof lastArg === 'function';
    let callback = () => {};
    if (lastArgIsCallback) {
      callback = lastArg;
      args.pop();
    }
    fn.apply(context, args)
      .then((result) => setImmediate(callback, null, result))
      .catch((error) => setImmediate(callback, error));
  };
}

export function setupDnode(connectionStream, api) {
  const dnode = Dnode(transformMethods(promiseToCb, api));
  connectionStream.pipe(dnode).pipe(connectionStream);
  return dnode;
}

export function cbToPromise(fn, context) {
  return (...args) => new Promise((resolve, reject) => {
    fn.call(context, ...args, (err, val) => {
      if (err) {
        reject(err);
      } else {
        resolve(val);
      }
    });
  });
}