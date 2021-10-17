import React from 'react';
import { styled } from '@linaria/react';

import { WalletTotal } from '@app/core/types';

import AssetLabel from '@app/uikit/AssetLabel';
import { AssetTotal, PALLETE_ASSETS } from '@app/model/wallet';
import { isNil } from '@app/core/utils';

const ListStyled = styled.ul`
  margin: 0 -20px;
  padding: 0 8px;
`;

interface AssetsProps {
  data: AssetTotal[];
}

const ListItemStyled = styled.li<{opt_color?: string, asset_id: number }>`
  margin-bottom: 10px;
  position: relative;
  padding: 20px;
  padding-left: 56px;

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
      ${({ asset_id, opt_color }) => {
        if (!isNil(opt_color)) {
          return opt_color;
        }

        return PALLETE_ASSETS[asset_id]
          ? PALLETE_ASSETS[asset_id]
          : PALLETE_ASSETS[asset_id % PALLETE_ASSETS.length];
      }} 0%,
      var(--color-dark-blue) 110%
    );
  }
`;

const Assets: React.FC<AssetsProps> = ({
  data,
}) => (
  <ListStyled>
    { data.map(({ asset_id, available, metadata_pairs }) => (
      <ListItemStyled 
          opt_color={metadata_pairs.OPT_COLOR ? metadata_pairs.OPT_COLOR : null} 
          key={asset_id} 
          asset_id={asset_id}>
        <AssetLabel value={available} asset_id={asset_id} />
      </ListItemStyled>
    ))}
  </ListStyled>
);

export default Assets;
