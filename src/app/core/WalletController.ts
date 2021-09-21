let backgroundProvider;

export default class WalletController {
  private static instance: WalletController;

  static getInstance() {
    if (this.instance != null) {
      return this.instance;
    }
    this.instance = new WalletController();
    return this.instance;
  }

  static start(pass: string) {
    backgroundProvider.start(pass);
  }

  static create(params) {
    backgroundProvider.create(params);
  }

  static setNotificationApproved(req) {
    backgroundProvider.setNotificationApproved(req);
  }

  static setNotificationRejected(req) {
    backgroundProvider.setNotificationRejected(req);
  }

  approveConnection = async (res) => {
    return backgroundProvider.approveConnection(res);
  } 

  init = (provider) => {
    backgroundProvider = provider;
  }

  send = async (data) => {
    return backgroundProvider.send(data)
  }

  getSeedPhrase = async () => {
    return backgroundProvider.getSeedPhrase();
  };
}
