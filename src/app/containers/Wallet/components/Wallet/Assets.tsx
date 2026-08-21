import React from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';
import { convertLowAmount, fromGroths, truncate } from '@core/utils';
import { AssetIcon, Rate } from '@app/shared/components';
import { PALLETE_ASSETS, ROUTES } from '@app/shared/constants';
import { AssetTotal } from '@app/containers/Wallet/interfaces';
import { useNavigate } from 'react-router-dom';

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0;
  margin: 0;
  list-style: none;
`;

const Tile = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 12px;
  clip-path: var(--cp-clip-sm);
  border: 1px solid var(--cp-hair);
  background: rgba(255, 255, 255, 0.015);
  cursor: pointer;
  transition: background 0.12s ease, border-color 0.12s ease, transform 0.12s ease;

  &:hover {
    background: rgba(0, 246, 210, 0.03);
    border-color: var(--cp-line);
    transform: translateY(-1px);
  }
`;

const IconBox = styled.div<{ boxColor: string }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: ${({ boxColor }) => `${boxColor}1a`};
  box-shadow: 0 0 12px -4px ${({ boxColor }) => boxColor};
`;

const iconClass = css`
  margin-right: 0 !important;
  transform: none !important;
  top: auto !important;
  vertical-align: middle !important;
`;

const Info = styled.div`
  flex: 1;
  min-width: 0;
`;

const AssetName = styled.div`
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--cp-muted);
  margin-bottom: 3px;
`;

const Amount = styled.div`
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 600;
  color: var(--cp-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const rateClass = css`
  margin: 0 !important;
  margin-top: 0 !important;
  font-family: var(--font-mono) !important;
  font-size: 12px !important;
  color: var(--cp-accent-3) !important;
  font-weight: 500 !important;
  white-space: nowrap;
  flex-shrink: 0;
  align-self: center;
`;

interface AssetsProps {
  data: AssetTotal[];
  isBalanceHidden?: boolean;
}

function getColor(asset_id: number, opt_color?: string): string {
  if (opt_color) return opt_color;
  return PALLETE_ASSETS[asset_id] ?? PALLETE_ASSETS[asset_id % PALLETE_ASSETS.length];
}

const Assets: React.FC<AssetsProps> = ({ data, isBalanceHidden }) => {
  const navigate = useNavigate();

  return (
    <List>
      {data.map(({ asset_id, available, metadata_pairs }) => {
        const name = truncate(metadata_pairs?.UN) ?? '';
        const amount = fromGroths(available);
        const amountLabel = convertLowAmount(amount);
        const color = getColor(asset_id, metadata_pairs?.OPT_COLOR);
        const isBeam = name === 'BEAM';

        return (
          <Tile key={asset_id} onClick={() => navigate(`${ROUTES.ASSETS.DETAIL.replace(':id', '')}${asset_id}`)}>
            <IconBox boxColor={color}>
              <AssetIcon asset_id={asset_id} className={iconClass} />
            </IconBox>

            <Info>
              <AssetName>{name || `Asset #${asset_id}`}</AssetName>
              <Amount>{isBalanceHidden ? '••••••' : `${amountLabel}${name ? ` ${name}` : ''}`}</Amount>
            </Info>

            {isBeam && !isBalanceHidden && <Rate value={amount} className={rateClass} />}
          </Tile>
        );
      })}
    </List>
  );
};

export default Assets;
