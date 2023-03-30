import React from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';

import {
  convertLowAmount, fromGroths, getSign, truncate,
} from '@core/utils';
import { Transaction } from '@core/types';
import { useSelector } from 'react-redux';
import { selectAssets } from '@app/containers/Wallet/store/selectors';
import AssetIcon from './AssetIcon';
import Rate from './Rate';

interface AssetLabelProps extends Partial<Transaction> {
  className?: string;
  iconClass?: string;
  showRate?: boolean;
  isBalanceHidden?: boolean;
}

const ContainerStyled = styled.div`
  display: flex;
  position: relative;
  text-align: left;
  font-size: 16px;
  font-weight: 600;
  color: white;
  flex-direction: column;
  height: 100%;
  justify-content: center;
`;

const AmountStyled = styled.span`
  flex-grow: 1;
  text-transform: uppercase;
  align-items: center;
  display: flex;
`;

const AssetID = styled.span`
  position: absolute;
  top: -12px;
  right: -12px;
  font-size: 12px;
  color: gray;
`;

const iconClassName = css`
  position: absolute;
  right: 100%;
`;

const rateStyle = css`
  opacity: 0.8;
  margin: 0;
  color: white;
  white-space: nowrap;
`;

const AssetLabel: React.FC<AssetLabelProps> = ({
  value,
  asset_id,
  income,
  fee,
  fee_only,
  className,
  iconClass,
  showRate = true,
  isBalanceHidden,
}) => {
  const assets = useSelector(selectAssets());
  const target = assets.find(({ asset_id: id }) => id === asset_id);

  const amount = fromGroths(fee_only ? fee : value);
  const signed = !!income;
  const sign = signed ? getSign(income) : '';
  const n = truncate(target?.metadata_pairs.UN);
  const name = `${n}` ?? '';
  const label = `${sign}${convertLowAmount(amount)} ${name}`;

  return (
    <ContainerStyled className={className}>
      <AssetID>
        #
        {asset_id}
      </AssetID>
      <AssetIcon asset_id={asset_id} className={iconClass || iconClassName} />
      <AmountStyled className="asset-name">{isBalanceHidden ? name : label}</AmountStyled>
      {showRate && !isBalanceHidden && n === 'BEAM' ? (
        <Rate value={amount} income={income} className={rateStyle} />
      ) : null}
    </ContainerStyled>
  );
};

export default AssetLabel;
