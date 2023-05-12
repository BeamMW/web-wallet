import React from 'react';
import { styled } from '@linaria/react';

import AssetLabel from '@app/shared/components/AssetLabel';
import { PALLETE_ASSETS, ROUTES } from '@app/shared/constants';
import { AssetTotal } from '@app/containers/Wallet/interfaces';
import { useNavigate } from 'react-router-dom';

const ListStyled = styled.ul`
  margin: 0 -20px;
  padding: 0 8px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`;

interface AssetsProps {
  data: AssetTotal[];
  isBalanceHidden?: boolean;
  assetClassName?: string;
}

const ListItemStyled = styled.li<{ opt_color?: string; asset_id: number }>`
  margin-bottom: 10px;
  position: relative;
  padding: 20px;
  padding-left: 56px;
  width: 49%;
  min-height: 80px;

  &.full-width {
    width: 100%;
  }
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
    if (opt_color) {
      return opt_color;
    }

    return PALLETE_ASSETS[asset_id] ? PALLETE_ASSETS[asset_id] : PALLETE_ASSETS[asset_id % PALLETE_ASSETS.length];
  }}
        0%,
      var(--color-dark-blue) 110%
    );
  }
`;

const Assets: React.FC<AssetsProps> = ({ data, isBalanceHidden, assetClassName }) => {
  const navigate = useNavigate();

  const navigateToDetail = (asset_id: number) => {
    navigate(`${ROUTES.ASSETS.DETAIL.replace(':id', '')}${asset_id}`);
  };

  return (
    <ListStyled>
      {data.map(({ asset_id, available, metadata_pairs }) => (
        <ListItemStyled
          opt_color={metadata_pairs.OPT_COLOR ? metadata_pairs.OPT_COLOR : null}
          key={asset_id}
          asset_id={asset_id}
          onClick={() => navigateToDetail(asset_id)}
          className={assetClassName}
        >
          <AssetLabel value={available} asset_id={asset_id} isBalanceHidden={isBalanceHidden} />
        </ListItemStyled>
      ))}
    </ListStyled>
  );
};

export default Assets;
