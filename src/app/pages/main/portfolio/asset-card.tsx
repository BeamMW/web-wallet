import React, { HTMLAttributes } from 'react';
import { styled } from '@linaria/react';
import { GROTHS_IN_BEAM } from '@state/shared';

import { WalletTotal } from '@core/types';

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
}

const AssetCardStyled = styled.li<AssetCardProps>`
  position: relative;
  padding: 20px;

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

export const AssetCard: React.FC<AssetCardProps> = ({
  asset_id,
  available,
  name,
}) => (
  <AssetCardStyled asset_id={asset_id}>
    <TitleStyled>
      {available / GROTHS_IN_BEAM} {name}
    </TitleStyled>
  </AssetCardStyled>
);

export default AssetCard;
