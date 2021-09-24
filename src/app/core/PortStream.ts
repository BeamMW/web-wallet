import { Duplex } from 'readable-stream';
import { Buffer } from 'buffer';

export class PortStream extends Duplex{
  _port = null;

  constructor(port){
    super({objectMode: true});
    this._port = port;
    port.onMessage.addListener(this._onMessage.bind(this));
    port.onDisconnect.addListener(this._onDisconnect.bind(this))
  }

  _onMessage(msg) {
    if (Buffer.isBuffer(msg)) {
      delete msg['_isBuffer'];
      const data = new Buffer(msg);
      this.push(data)
    } else {
      this.push(msg)
    }
  }

  _onDisconnect() {
    this.destroy()
  }

  _read(){}

  _write(msg, encoding, cb) {
    try {
      if (Buffer.isBuffer(msg)) {
          const data = msg.toJSON();
          data['_isBuffer'] = true;
          this._port.postMessage(data)
      } else {
          this._port.postMessage(msg)
      }
    } catch (err) {
      return cb(new Error('PortStream - disconnected'))
    }
    cb()
  }
}