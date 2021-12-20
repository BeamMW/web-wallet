import React from 'react';
import { styled } from '@linaria/react';
import { Transaction } from '@core/types';
import { StatusLabel } from '@app/shared/components';
import { css } from '@linaria/core';
import { fromGroths, getSign, truncate } from '@core/utils';
import { AssetTotal } from '@app/containers/Wallet/interfaces';
import AssetIcon from '../../../../shared/components/AssetIcon';
import Rate from '../../../../shared/components/Rate';

const ContainerStyled = styled.div`
  display: flex;
  position: relative;
  text-align: left;
  font-size: 16px;
  font-weight: 600;
  color: white;
  flex-direction: row;
`;

const AmountStyled = styled.span`
  flex-grow: 1;
`;

const iconClassName = css`
  position: absolute;
  right: 100%;
  margin-top: -4px;
`;

const rateStyle = css`
  opacity: 0.8;
  margin: 0;
  color: white;
  white-space: nowrap;
`;

const MultipleAssets = styled.div`
  position: relative;
  margin-left: -30px;
  margin-right: 38px;
  margin-top: -4px;
  > div {
    margin: 0;
    position: absolute;
    &:first-child {
      margin-left: 6px;
    }
  }
`;

const TransactionDate = styled.div`
  margin-top: 8px;
  font-size: 14px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  color: #fff;
  text-align: right;
  width: 100%;
  opacity: 0.5;
  > span {
    &::after {
      content: '|';
      padding: 0 12px;
    }

    &:last-child {
      &::after {
        display: none;
      }
    }
  }
`;

const TransactionItem = ({ data, assets }: { data: Transaction; assets: AssetTotal[] }) => {
  const {
    asset_id, invoke_data, income, fee, fee_only, value,
  } = data;

  const target = assets.find(({ asset_id: id }) => id === asset_id);

  const hasMultipleAssets = invoke_data && invoke_data.some((cont) => cont.amounts.length > 1);

  const amount = fromGroths(fee_only ? fee : value);
  const signed = !!income;
  const sign = signed ? getSign(income) : '';
  const name = truncate(target?.metadata_pairs.UN) ?? '';
  const label = `${sign}${amount} ${name}`;

  const multipleAssetsTitle = () => {
    let title = '';
    invoke_data.forEach((i) => i.amounts.forEach((a) => {
      const tg = assets.find(({ asset_id: id }) => id === a.asset_id);
      const n = truncate(tg?.metadata_pairs.UN) ?? '';
      const am = fromGroths(fee_only ? fee : a.amount);
      title += `${sign}${am} ${n} `;
    }));
    return title;
  };

  const multipleAssetsAmount = () => {
    let res = 0;

    invoke_data.forEach((i) => i.amounts.forEach((a) => {
      const am = fromGroths(fee_only ? fee : a.amount);

      if (am > res) res = am;
    }));
    return res;
  };

  const getTransactionDate = () => {
    const txDate = new Date(data.create_time * 1000);
    const time = txDate.toLocaleTimeString(undefined, { timeStyle: 'short' });
    const date = txDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

    return (
      <>
        <span>{date}</span>
        <span>{time}</span>
      </>
    );
  };

  return (
    <>
      {!hasMultipleAssets ? (
        <ContainerStyled>
          <AssetIcon asset_id={data.asset_id} className={iconClassName} />
          <AmountStyled>{label}</AmountStyled>
          <Rate value={amount} income={income} className={rateStyle} />
        </ContainerStyled>
      ) : (
        <ContainerStyled>
          <MultipleAssets>
            {invoke_data.map((i) => i.amounts.map((a) => <AssetIcon key={a.asset_id} asset_id={a.asset_id} />))}
          </MultipleAssets>
          <AmountStyled>{multipleAssetsTitle()}</AmountStyled>
          <Rate value={multipleAssetsAmount()} income={income} className={rateStyle} />
        </ContainerStyled>
      )}
      <StatusLabel data={data} />
      <TransactionDate>{getTransactionDate()}</TransactionDate>
    </>
  );
};

export default TransactionItem;
