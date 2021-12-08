import { AssetTotal } from '@model/wallet';

export const GROTHS_IN_BEAM = 100000000;
export const AMOUNT_MAX = 99999999;
export const FEE_DEFAULT = 100000;

export enum AddressLabel {
  ERROR = 'Invalid wallet address',
  MAX_PRIVACY = 'Guarantees maximum anonymity set of up to 64K.',
  OFFLINE = 'Offline address.',
  REGULAR = 'Regular address',
}

export enum AddressTip {
  MAX_PRIVACY = 'Transaction can last at most 72 hours.',
  OFFLINE = 'Make sure the address is correct as offline transactions cannot be canceled.',
  REGULAR = 'The recipient must get online within the next 12 hours and you should get online within 2 hours afterwards.',
}

export enum AmountError {
  FEE = 'Insufficient funds to pay transaction fee.',
  AMOUNT = 'Insufficient funds to complete the transaction. Maximum amount is ',
}

export const ASSET_BLANK: AssetTotal = {
  asset_id: 0,
  available: 0,
  available_str: '0',
  maturing: 0,
  maturing_str: '0',
  receiving: 0,
  receiving_str: '0',
  sending: 0,
  sending_str: '0',
  metadata_pairs: {
    N: '',
    SN: '',
    UN: '',
  },
};
