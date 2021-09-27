import { setupDnode } from '@core/setupDnode';
import WasmWallet from './WasmWallet';

const wallet = WasmWallet.getInstance();

export default class DnodeApp {
  private appApi = null;

  pageApi() {
    return {
      createAppAPI: async (id: string, name: string, cb) => new Promise((resolve, reject) => {
        wallet.createAppAPI(id, name, cb, (api) => {
          if (api === undefined) {
            reject();
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
    const api = this.pageApi();
    const dnode = setupDnode(connectionStream, api);

    dnode.on('remote', (remote) => {
      console.log(origin);
      console.log(remote);
    });
  }
}
