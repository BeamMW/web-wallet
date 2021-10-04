import React from 'react';
import { useStore } from 'effector-react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';

import { $rate, GROTHS_IN_BEAM } from '@app/model/rates';
import { $assets } from '@app/model/wallet';

import { isNil, toUSD } from '@app/core/utils';
import { Contract } from '@app/core/types';
import AssetIcon from './AssetIcon';

interface AssetLabelProps {
  value: number;
  asset_id: number;
  income?: boolean;
  invoke_data?: Contract[];
}

const ContainerStyled = styled.div`
  display: flex;
  position: relative;
`;

const LabelStyled = styled.span<{ income: boolean }>`
  flex-grow: 1;
  text-align: left;
  font-size: 16px;
  font-weight: 600;
  color: ${({ income }) => {
    if (isNil(income)) {
      return 'white';
    }

    return income ? 'var(--color-blue)' : 'var(--color-purple)';
  }};
`;

const RateStyled = styled.div`
  opacity: 0.8;
  color: white;
`;

const iconClassName = css`
  position: absolute;
  right: 100%;
  margin-top: -4px;
`;

function getSign(positive: boolean): string {
  return positive ? '+ ' : '- ';
}

const AssetLabel: React.FC<AssetLabelProps> = ({
  value,
  asset_id,
  income,
  invoke_data,
}) => {
  const assets = useStore($assets);
  const rate = useStore($rate);
  const target = assets.find(({ asset_id: id }) => id === asset_id);

  const hasMultipleAssets = !isNil(invoke_data) && invoke_data.some((cont) => (
    cont.amounts.length > 1
  ));

  const amount = value / GROTHS_IN_BEAM;
  const sign = !isNil(income) ? getSign(income) : '';
  const name = target?.metadata_pairs.UN ?? '';
  const label = hasMultipleAssets ? 'Multiple Assets' : `${sign}${amount} ${name}`;
  const usd = isNil(value) ? '' : `${sign}${toUSD(amount, rate)}`;

  return (
    <ContainerStyled>
      <AssetIcon asset_id={asset_id} className={iconClassName} />
      <LabelStyled income={income}>{ label }</LabelStyled>
      <RateStyled>{ usd }</RateStyled>
    </ContainerStyled>
  );
};

export default AssetLabel;
