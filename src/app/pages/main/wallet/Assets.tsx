import React from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';
import { GROTHS_IN_BEAM } from '@app/model/rates';

import { WalletTotal } from '@app/core/types';
import { useStore } from 'effector-react';
import AssetIcon from '@uikit/AssetIcon';

import { $assets, PALLETE_ASSETS } from './model';

const ListStyled = styled.ul`
  margin: 0 -20px;
  padding: 0 8px;
`;

interface AssetsProps {
  data: WalletTotal[];
}

const ListItemStyled = styled.li<{ asset_id: number }>`
  margin-bottom: 10px;
  position: relative;
  padding: 20px;
  padding-left: 62px;
  color: ${({ asset_id }) => PALLETE_ASSETS[asset_id]};

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
      ${({ asset_id }) => PALLETE_ASSETS[asset_id]} 0%,
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

const Assets: React.FC<AssetsProps> = ({
  data,
}) => {
  const assets = useStore($assets);

  return (
    <ListStyled>
      { data.map(({ asset_id, available }) => (
        <ListItemStyled asset_id={asset_id}>
          <AssetIcon asset_id={asset_id} className={iconClassName} />
          <TitleStyled>
            {available / GROTHS_IN_BEAM}
            {' '}
            {assets[asset_id].metadata_pairs.N}
          </TitleStyled>
        </ListItemStyled>
      ))}
    </ListStyled>
  );
};

export default Assets;
