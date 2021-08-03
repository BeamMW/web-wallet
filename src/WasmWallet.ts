declare const BeamModule: any;
export default class WasmWallet {
  private static instance: WasmWallet;

  static getInstance() {
    if (this.instance != null) {
      return this.instance;
    }

    return new WasmWallet();
  }

  constructor() {}

  init() {
    BeamModule().then(module => {
      console.log(module);
    });
  }
}
