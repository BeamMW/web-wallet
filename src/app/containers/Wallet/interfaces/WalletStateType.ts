import {
  Asset, Transaction, WalletTotal, AddressData,
} from '@core/types';
import { TransactionAmount } from './TransactionAmount';

export type AssetTotal = WalletTotal & Partial<Asset>;

export interface WalletStateType {
  totals: WalletTotal[];
  assets: Asset[];
  assets_total: AssetTotal[];
  transactions: Transaction[];
  rate: number;
  address: string;
  receive_amount: TransactionAmount;
  send_address_data: AddressData;
  send_fee: number;
  change: number;
}
