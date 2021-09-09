import React from 'react';
import { styled } from '@linaria/react';

import { Transaction } from '@app/core/types';

import { AssetLabel, StatusLabel } from '@app/uikit';

const ListStyled = styled.ul`
  margin: 0 -20px;
`;

interface TransactionsProps {
  data: Transaction[];
}

const ListItemStyled = styled.li`
  position: relative;
  padding: 20px;
  padding-left: 70px;

  &:nth-child(odd) {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const Transactions: React.FC<TransactionsProps> = ({
  data,
}) => (
  <ListStyled>
    { data.map((tx, index) => (
      <ListItemStyled key={index}>
        <AssetLabel signed value={tx.value} asset_id={tx.asset_id} />
        <StatusLabel data={tx} />
      </ListItemStyled>
    ))}
  </ListStyled>
);

export default Transactions;
