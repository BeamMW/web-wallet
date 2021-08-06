import WasmWallet from './WasmWallet';
import { RPCMethod } from './types';

function sendRequest(method: RPCMethod, params?: any): void {
  WasmWallet.getInstance().send(method, params);
}

export function getWalletStatus() {
  sendRequest(RPCMethod.GetWalletStatus);
}

export function createAddress() {
  sendRequest(RPCMethod.CreateAddress);
}
