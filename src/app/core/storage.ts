import * as extensionizer from 'extensionizer';

const localArea = extensionizer.storage && extensionizer.storage.local ? extensionizer.storage.local : null;

function proxy(op: 'get' | 'set' | 'remove', payload: any): Promise<any> {
  return new Promise((resolve) => {
    extensionizer.runtime.sendMessage({ target: 'sw-storage', op, payload }, (res) => {
      // Read lastError so Chrome doesn't log "Unchecked runtime.lastError".
      if (extensionizer.runtime.lastError) {
        /* ignore */
      }
      resolve(res ? res.result : undefined);
    });
  });
}

export const storageLocal = {
  get(keys: any, cb?: (items: any) => void): void {
    if (localArea) {
      localArea.get(keys, cb);
      return;
    }
    proxy('get', keys).then((items) => {
      if (cb) cb(items || {});
    });
  },
  set(items: any, cb?: () => void): void {
    if (localArea) {
      localArea.set(items, cb);
      return;
    }
    proxy('set', items).then(() => {
      if (cb) cb();
    });
  },
  remove(keys: any, cb?: () => void): void {
    if (localArea) {
      localArea.remove(keys, cb);
      return;
    }
    proxy('remove', keys).then(() => {
      if (cb) cb();
    });
  },
};
