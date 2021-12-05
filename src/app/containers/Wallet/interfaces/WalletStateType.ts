import { Asset, Transaction, WalletTotal } from '@core/types';
import { ReceiveAmount } from './ReceiveAmount';

export type AssetTotal = WalletTotal & Partial<Asset>;

export interface WalletStateType {
  totals: WalletTotal[];
  assets: Asset[];
  assets_total: AssetTotal[];
  transactions: Transaction[];
  rate: number;
  address: string;
  receive_amount: ReceiveAmount;
}
