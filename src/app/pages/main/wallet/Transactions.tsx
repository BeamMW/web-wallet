import React from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';
import { GROTHS_IN_BEAM } from '@app/model';

import { Transaction } from '@app/core/types';
import { useStore } from 'effector-react';
import AssetIcon from './AssetIcon';
import { $assets } from './model';

const ListStyled = styled.ul`
  margin: 0 -20px;
  padding: 0 8px;
`;

interface TransactionsProps {
  data: Transaction[];
}

const ListItemStyled = styled.li`
  position: relative;
`;

const TitleStyled = styled.h3`
  margin: 0;
  text-align: left;
  font-size: 16px;
  font-weight: 600;
  color: white;
`;

const iconClassName = css`
  position: absolute;
  top: 16px;
  left: 20px;
`;

const Transactions: React.FC<TransactionsProps> = ({
  data,
}) => {
  const assets = useStore($assets);

  return (
    <ListStyled>
      { data.map(({ asset_id, value }) => (
        <ListItemStyled>
          <AssetIcon asset_id={asset_id} className={iconClassName} />
          <TitleStyled>
            {value / GROTHS_IN_BEAM}
            {assets[asset_id].metadata_pairs.N}
          </TitleStyled>
        </ListItemStyled>
      ))}
    </ListStyled>
  );
};

export default Transactions;
