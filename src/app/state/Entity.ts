import { ChangeEvent } from '@core/types';
import { createEvent, restore } from 'effector';

export default class Entity<T, E extends ChangeEvent> {
  private _reset = createEvent<T[]>();
  private _append = createEvent<T[]>();
  private _remove = createEvent<T[]>();
  private _update = createEvent<T[]>();

  private _store = restore(this._reset, []);

  constructor(private _key: string, private _id: string) {
    const id = this._id;
    const equals = (a: T, b: T) => a[id] === b[id];

    this._store.on(this._append, (state, payload) => state.concat(payload));

    this._store.on(this._remove, (state, payload) => {
      // for every item in payload
      return payload.reduce((result, b) => {
        // remove items in state that are equal
        return result.filter(a => !equals(a, b));
      }, state);
    });

    this._store.on(this._update, (state, payload) => {
      // for every item in payload
      return payload.reduce((result, b) => {
        // replace items in state that are equal
        return result.map(a => (equals(a, b) ? b : a));
      }, state);
    });
  }

  getStore() {
    return this._store;
  }

  push(event: E) {
    const data = event[this._key];
    const { change } = event;

    switch (change) {
      case 0: // added
        this._append(data);
        break;
      case 1: // removed
        this._remove(data);
        break;
      case 2: // updated
        this._update(data);
        break;
      case 3: // reset
        this._reset(data);
        break;
      default:
    }
  }
}
