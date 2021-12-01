import { Asset, Transaction, WalletTotal } from '@core/types';

export type AssetTotal = WalletTotal & Partial<Asset>;

export interface WalletStateType {
  totals: WalletTotal[];
  assets: Asset[];
  assets_total: AssetTotal[];
  transactions: Transaction[];
}
