import React from 'react';
import { useStore } from 'effector-react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';

import { GROTHS_IN_BEAM } from '@app/model/rates';
import { $assets } from '@pages/main/wallet/model';

import AssetIcon from './AssetIcon';

interface AssetLabelProps {
  value: number;
  asset_id: number;
}

const ContainerStyled = styled.div`
  display: inline-block;
`;

const LabelStyled = styled.span`
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

const AssetLabel: React.FC<AssetLabelProps> = ({
  value,
  asset_id,
}) => {
  const assets = useStore($assets);
  const groths = value / GROTHS_IN_BEAM;
  const label = assets[asset_id].metadata_pairs.N;

  return (
    <ContainerStyled>
      <AssetIcon asset_id={asset_id} className={iconClassName} />
      <LabelStyled>
        {`${groths} ${label}`}
      </LabelStyled>
    </ContainerStyled>
  );
};

export default AssetLabel;
