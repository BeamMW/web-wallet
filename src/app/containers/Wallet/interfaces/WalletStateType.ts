import { Asset, WalletTotal, AddressData } from '@core/types';
import { TransactionAmount } from './TransactionAmount';

export type AssetTotal = WalletTotal & Partial<Asset>;

export interface WalletStateType {
  totals: WalletTotal[];
  assets: Asset[];
  assets_total: AssetTotal[];
  rate: number;
  address: string;
  sbbs: null | string;
  receive_amount: TransactionAmount;
  send_address_data: AddressData;
  send_fee: number;
  change: number;
  asset_change: number;
  is_send_ready: boolean;
  selected_asset_id: number;
}
