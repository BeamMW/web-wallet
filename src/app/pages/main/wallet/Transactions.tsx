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

const fromInvokeData = (data: Contract): Partial<Transaction> | boolean => {
  if (data.amounts.length > 1) {
    return false;
  }

  const [{ amount: value, asset_id }] = data.amounts;

  return {
    value,
    asset_id,
  };
};

const Transactions: React.FC<TransactionsProps> = ({
  data,
}) => (
  <ListStyled>
    { data.map((tx, index) => {
      const { invoke_data: contracts } = tx;
      const payload = isNil(contracts) ? false : fromInvokeData(contracts[0]);

      return (
        <ListItemStyled key={index}>
          <AssetLabel {...tx} {...payload} />
          <StatusLabel data={tx} />
        </ListItemStyled>
      );
    })}
  </ListStyled>
);

export default Transactions;
