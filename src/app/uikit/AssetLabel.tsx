import React from 'react';
import { useStore } from 'effector-react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';

import { $rate, GROTHS_IN_BEAM } from '@app/model/rates';
import { $assets } from '@pages/main/wallet/model';

import { toUSD } from '@app/core/utils';
import AssetIcon from './AssetIcon';

interface AssetLabelProps {
  value: number;
  asset_id: number;
  signed?: boolean;
}

const ContainerStyled = styled.div`
  display: flex;
  justify-content: space-between;
  position: relative;
`;

const LabelStyled = styled.span`
  text-align: left;
  font-size: 16px;
  font-weight: 600;
  color: white;
`;

const RateStyled = styled.div`
  opacity: 0.8;
  color: white;
`;

const iconClassName = css`
  position: absolute;
  right: 100%;
  margin-top: -4px;
  margin-right: 16px;
`;

function getSign(value: number): string {
  if (value === 0) {
    return '';
  }
  return value > 0 ? '+ ' : '- ';
}

const AssetLabel: React.FC<AssetLabelProps> = ({
  value,
  asset_id,
  signed,
}) => {
  const assets = useStore($assets);
  const rate = useStore($rate);

  const amount = value / GROTHS_IN_BEAM;
  const sign = signed ? getSign(amount) : '';
  const name = assets[asset_id].metadata_pairs.N;
  const label = `${sign}${amount} ${name}`;
  const usd = toUSD(amount, rate);

  return (
    <ContainerStyled>
      <AssetIcon asset_id={asset_id} className={iconClassName} />
      <LabelStyled>
        { label}
      </LabelStyled>
      <RateStyled>
        { sign }
        { usd }
      </RateStyled>
    </ContainerStyled>
  );
};

export default AssetLabel;
