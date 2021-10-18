import React from 'react';
import { styled } from '@linaria/react';

import { Amount, Contract, Transaction } from '@app/core/types';

import { AssetLabel, StatusLabel } from '@app/uikit';
import { isNil } from '@app/core/utils';

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

const fromInvokeData = (data: Contract): Partial<Transaction> => {
  if (data.amounts.length > 1) {
    return null;
  }

  const [{ amount, asset_id }] = data.amounts;

  return {
    value: Math.abs(amount),
    income: amount < 0,
    asset_id,
  };
};

const Transactions: React.FC<TransactionsProps> = ({
  data: transactions,
}) => (
  <ListStyled>
    { transactions.map((tx, index) => {
      const { invoke_data: contracts } = tx;
      const payload = isNil(contracts) ? null : fromInvokeData(contracts[0]);

      const data = isNil(payload) ? tx : {
        ...tx,
        ...payload,
      };

      return (
        <ListItemStyled key={index}>
          <AssetLabel {...data} />
          <StatusLabel data={data} />
        </ListItemStyled>
      );
    })}
  </ListStyled>
);

export default Transactions;
