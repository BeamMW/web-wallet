import React from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';
import { GROTHS_IN_BEAM } from '@app/model';

import { WalletTotal } from '@core/types';

import BeamIcon from '@icons/icon-beam.svg';
import AssetIcon from '@icons/icon-asset.svg';

const COLORS = [
  '#72fdff',
  '#2acf1d',
  '#ffbb54',
  '#d885ff',
  '#008eff',
  '#ff746b',
  '#91e300',
  '#ffe75a',
  '#9643ff',
  '#395bff',
  '#ff3b3b',
  '#73ff7c',
  '#ffa86c',
  '#ff3abe',
  '#0aaee1',
  '#ff5200',
  '#6464ff',
  '#ff7a21',
  '#63afff',
  '#c81f68',
];

interface AssetCardProps extends Partial<WalletTotal> {
  name?: string;
  short?: string;
  onClick?: React.MouseEventHandler;
}

const AssetCardStyled = styled.li<AssetCardProps>`
  margin-bottom: 10px;
  position: relative;
  padding: 20px;
  padding-left: 62px;
  color: ${({ asset_id }) => COLORS[asset_id]};

  &:before {
    opacity: 0.3;
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    width: 100%;
    height: 100%;
    border-radius: 10px;
    background-image: linear-gradient(
      90deg,
      ${({ asset_id }) => COLORS[asset_id]} 0%,
      var(--color-dark-blue) 110%
    );
  }
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

const AssetCard: React.FC<AssetCardProps> = ({
  asset_id,
  available,
  name,
}) => (
  <AssetCardStyled asset_id={asset_id}>
    {asset_id === 0 ? (
      <BeamIcon className={iconClassName} />
    ) : (
      <AssetIcon className={iconClassName} />
    )}

    <TitleStyled>
      {available / GROTHS_IN_BEAM}
      {' '}
      {name}
    </TitleStyled>
  </AssetCardStyled>
);

export default AssetCard;
