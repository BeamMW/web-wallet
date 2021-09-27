/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign, @typescript-eslint/dot-notation */
/* eslint-disable no-buffer-constructor, no-underscore-dangle, consistent-return */
import { Duplex } from 'readable-stream';
import { Buffer } from 'buffer';

export default class PortStream extends Duplex {
  private port = null;

  constructor(port) {
    super({
      objectMode: true,
    });
    this.port = port;
    port.onMessage.addListener(this.onMessage.bind(this));
    port.onDisconnect.addListener(this.onDisconnect.bind(this));
  }

  private onMessage(msg) {
    if (Buffer.isBuffer(msg)) {
      delete msg['_isBuffer'];
      const data = new Buffer(msg);
      this.push(data);
    } else {
      this.push(msg);
    }
  }

  private onDisconnect() {
    this.destroy();
  }

  _read() {}

  _write(msg, encoding, cb) {
    try {
      if (Buffer.isBuffer(msg)) {
        const data = msg.toJSON();
        data['_isBuffer'] = true;
        this.port.postMessage(data);
      } else {
        this.port.postMessage(msg);
      }
    } catch (err) {
      return cb(new Error('PortStream - disconnected'));
    }
    cb();
  }
}
