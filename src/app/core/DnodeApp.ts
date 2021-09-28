import { setupDnode } from '@core/setupDnode';
import WasmWallet from './WasmWallet';

const wallet = WasmWallet.getInstance();

export default class DnodeApp {
  private appApi = null;

  pageApi(origin: string) {
    return {
      createAppAPI: async (apiver: string, minapiver: string, appname: string, handler: any) => new Promise((resolve, reject) => {
        wallet.createAppAPI(apiver, minapiver, origin, appname, handler, (err, api) => {
          if (err) {
              reject(err);
          }
          this.appApi = api;
          resolve(true);
        });
      }),
      callWalletApi: async (callid: string, method: string, params) => {
        const request = {
          jsonrpc: '2.0',
          id: callid,
          method,
          params,
        };
        this.appApi.callWalletApi(JSON.stringify(request));
      },
    };
  }

  connectPage(connectionStream, origin) {
    const api = this.pageApi(origin);
    const dnode = setupDnode(connectionStream, api);

    dnode.on('remote', (remote) => {
      console.log(origin);
      console.log(remote);
    });
  }
}
