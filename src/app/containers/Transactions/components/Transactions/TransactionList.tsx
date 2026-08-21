import React from 'react';
import { styled } from '@linaria/react';

import { Contract, Transaction } from '@core/types';

import { useSelector } from 'react-redux';
import { selectAssets } from '@app/containers/Wallet/store/selectors';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@app/shared/constants';
import TransactionItem from './TransactionItem';
import EmptyTransaction from './EmptyTransaction';

const ListStyled = styled.ul`
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

interface TransactionsProps {
  data: Transaction[];
  isBalanceHidden?: boolean;
  className?: string;
  itemClassName?: string;
}

const ListItemStyled = styled.li`
  position: relative;
  padding: 13px;
  clip-path: var(--cp-clip-sm);
  background: rgba(255, 255, 255, 0.015);
  border: 1px solid var(--cp-hair);
  cursor: pointer;
  transition: background-color 120ms ease, border-color 120ms ease, transform 120ms ease;

  &:hover {
    transform: translateY(-1px);
    background: rgba(0, 246, 210, 0.03);
    border-color: var(--cp-line);
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

const TransactionList: React.FC<TransactionsProps> = ({
  data: transactions,
  isBalanceHidden,
  className,
  itemClassName,
}) => {
  const assets = useSelector(selectAssets());
  const navigate = useNavigate();

  const navigateTransactionDetail = (id: string) => {
    navigate(`${ROUTES.TRANSACTIONS.DETAIL.replace(':id', '')}${id}`);
  };

  return transactions.length ? (
    <ListStyled className={className}>
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
          <ListItemStyled className={itemClassName} key={tx.txId} onClick={() => navigateTransactionDetail(tx.txId)}>
            <TransactionItem data={data} assets={assets} isBalanceHidden={isBalanceHidden} />
          </ListItemStyled>
        );
      })}
    </ListStyled>
  ) : (
    <EmptyTransaction />
  );
};

export default TransactionList;
