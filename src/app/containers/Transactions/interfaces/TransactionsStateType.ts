import { Transaction, TransactionDetail, PaymentProof } from '@core/types';

export interface TransactionsStateType {
  transactions: Transaction[];
  transaction_detail: TransactionDetail | null;
  payment_proof: PaymentProof | null;
}
