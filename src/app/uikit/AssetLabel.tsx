import React from 'react';
import { useStore } from 'effector-react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';

import { $assets } from '@app/model/wallet';

import {
  fromGroths, getSign, isNil, truncate,
} from '@app/core/utils';
import { Transaction } from '@app/core/types';
import AssetIcon from './AssetIcon';
import Rate from './Rate';

interface AssetLabelProps extends Transaction {

}

const ContainerStyled = styled.div`
  display: flex;
  position: relative;
  text-align: left;
  font-size: 16px;
  font-weight: 600;
  color: white;
`;

const AmountStyled = styled.span`
  flex-grow: 1;
`;

const iconClassName = css`
  position: absolute;
  right: 100%;
  margin-top: -4px;
`;

const rateStyle = css`
  opacity: 0.8;
  margin: 0;
  color: white;
  white-space: nowrap;
`;

const AssetLabel: React.FC<AssetLabelProps> = ({
  value,
  asset_id,
  income,
  fee,
  fee_only,
  invoke_data,
}) => {
  const assets = useStore($assets);
  const target = assets.find(({ asset_id: id }) => id === asset_id);

  const hasMultipleAssets = !isNil(invoke_data) && invoke_data.some((cont) => (
    cont.amounts.length > 1
  ));

  const amount = fromGroths(fee_only ? fee : value);
  const signed = !isNil(income);
  const sign = signed ? getSign(income) : '';
  const name = truncate(target?.metadata_pairs.UN) ?? '';
  const label = hasMultipleAssets ? 'Multiple Assets' : `${sign}${amount} ${name}`;

  return (
    <ContainerStyled>
      <AssetIcon asset_id={asset_id} className={iconClassName} />
      <AmountStyled>{ label }</AmountStyled>
      <Rate value={amount} income={income} className={rateStyle} />
    </ContainerStyled>
  );
};

export default AssetLabel;
