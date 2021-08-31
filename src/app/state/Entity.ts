import { WalletChangeEvent } from '@core/types';
import { createEvent, restore } from 'effector';

export default class Entity<T, E extends WalletChangeEvent> {
  private reset = createEvent<T[]>();

  private append = createEvent<T[]>();

  private remove = createEvent<T[]>();

  private update = createEvent<T[]>();

  private store = restore(this.reset, []);

  constructor(private key: string, private id: string) {
    const equals = (a: T, b: T) => a[id] === b[id];

    this.store.on(this.append, (state, payload) => state.concat(payload));

    this.store.on(this.remove, (state, payload) => (
      // for every item in payload
      payload.reduce((result, b) => (
        // remove items in state that are equal
        result.filter((a) => !equals(a, b))
      ), state)
    ));

    this.store.on(this.update, (state, payload) => (
      // for every item in payload
      payload.reduce((result, b) => (
        // replace items in state that are equal
        result.map((a) => (equals(a, b) ? b : a))
      ), state)
    ));
  }

  getStore() {
    return this.store;
  }

  push(event: E) {
    const data = event[this.key];
    const { change } = event;

    switch (change) {
      case 0: // added
        this.append(data);
        break;
      case 1: // removed
        this.remove(data);
        break;
      case 2: // updated
        this.update(data);
        break;
      case 3: // reset
        this.reset(data);
        break;
      default:
    }
  }
}
