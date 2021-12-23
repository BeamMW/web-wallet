import React from 'react';
import { styled } from '@linaria/react';

import { Contract, Transaction } from '@core/types';

import { useSelector } from 'react-redux';
import { selectAssets } from '@app/containers/Wallet/store/selectors';
import TransactionItem from './TransactionItem';
import EmptyTransaction from './EmptyTransaction';

const ListStyled = styled.ul`
  margin: 0 -20px;
`;

interface TransactionsProps {
  data: Transaction[];
}

const ListItemStyled = styled.li`
  position: relative;
  padding: 20px;
  padding-left: 56px;

  &:nth-child(odd) {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const fromInvokeData = (data: Contract, fee: number): Partial<Transaction> => {
  if (data.amounts.length === 1) {
    const [{ amount, asset_id }] = data.amounts;

    const value = asset_id === 0 && amount < 0 ? amount + fee : amount;

    return {
      value: Math.abs(value),
      income: amount < 0,
      asset_id,
    };
  }

  return null;
};

const TransactionList: React.FC<TransactionsProps> = ({ data: transactions }) => {
  const assets = useSelector(selectAssets());
  return transactions.length ? (
    <ListStyled>
      {transactions.map((tx) => {
        const { invoke_data: contracts } = tx;
        const payload = contracts ? fromInvokeData(contracts[0], tx.fee) : null;

        const data = !payload
          ? tx
          : {
            ...tx,
            ...payload,
          };

        return (
          <ListItemStyled key={tx.txId}>
            <TransactionItem data={data} assets={assets} />
          </ListItemStyled>
        );
      })}
    </ListStyled>
  ) : (
    <EmptyTransaction />
  );
};

export default TransactionList;
