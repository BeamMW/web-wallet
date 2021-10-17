import React from 'react';

import { WalletTotal } from '@core/types';

import {
  BeamIcon as BeamIconSvg,
  AssetIcon as AssetIconSvg,
} from '@app/icons';

import { styled } from '@linaria/react';
import { PALLETE_ASSETS } from '@app/model/wallet';

interface AssetIconProps extends Partial<WalletTotal> {
  asset_id?: number;
  className?: string;
}

const ContainerStyled = styled.div<AssetIconProps>`
  display: inline-block;
  vertical-align: middle;
  width: 26px;
  height: 26px;
  margin-right: 10px;
  color: ${({ asset_id }) => {
    return PALLETE_ASSETS[asset_id]
    ? PALLETE_ASSETS[asset_id]
    : PALLETE_ASSETS[asset_id % PALLETE_ASSETS.length]
  }};
`;

const AssetIcon: React.FC<AssetIconProps> = ({
  asset_id = 0,
  className,
}) => {
  const IconComponent = asset_id === 0 ? BeamIconSvg : AssetIconSvg;
  return (
    <ContainerStyled asset_id={asset_id} className={className}>
      <IconComponent />
    </ContainerStyled>
  );
};

export default AssetIcon;
