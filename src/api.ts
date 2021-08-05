import WasmWallet, { RPCMethod } from '@wallet';

function sendRequest(method: RPCMethod, params?: any): void {
  WasmWallet.getInstance().send(method, params);
}

export function getWalletStatus() {
  sendRequest(RPCMethod.GetWalletStatus);
}

export function getAddressList() {
  sendRequest(RPCMethod.GetAddressList);
}

export function getUTXO() {
  sendRequest(RPCMethod.GetUTXO);
}

export function getTXList() {
  sendRequest(RPCMethod.GetTXList);
}

export function loadAssetsInfo(assets: any[]) {
  for (let { asset_id } of assets) {
    if (asset_id > 0) {
      sendRequest(RPCMethod.GetAssetInfo, {
        assets: true,
        asset_id: asset_id,
      });
    }
  }
}
