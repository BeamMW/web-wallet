import { setupDnode } from '@core/setupDnode';

export default class DnodeApp {
  private appApi = null;

  private appApiHandler = null;

  async createAppAPI(
    wallet: any,
    apiver: string,
    apivermin: string,
    appname: string,
    origin: string,
  ) {
    this.appApi = await wallet.createAppAPI(apiver, apivermin, origin, appname, (...args) => {
      this.appApiHandler(...args);
    });
  }

  pageApi() {
    return {
      callWalletApiResult: async (handler: any) => {
        this.appApiHandler = handler;
      },
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
