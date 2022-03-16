import React, { useMemo } from 'react';
import { styled } from '@linaria/react';
import { Transaction } from '@core/types';
import { Rate, StatusLabel } from '@app/shared/components';
import { css } from '@linaria/core';
import { fromGroths, getSign, truncate } from '@core/utils';
import { AssetTotal } from '@app/containers/Wallet/interfaces';
import AssetIcon from '../../../../shared/components/AssetIcon';

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

export const MultipleAssets = styled.div`
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

const TransactionBottom = styled.div`
  display: flex;
  justify-content: space-between;
`;

const TransactionSource = styled.div`
  margin-top: 8px;
  font-size: 14px;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  color: #fff;
  text-align: left;
  width: 100%;
  opacity: 0.7;
  font-weight: bold;
`;

const TransactionItem = ({
  data,
  assets,
  isBalanceHidden,
}: {
  data: Transaction;
  assets: AssetTotal[];
  isBalanceHidden?: boolean;
}) => {
  const {
    asset_id, invoke_data, income, fee, fee_only, value,
  } = data;

  const target = assets.find(({ asset_id: id }) => id === asset_id);

  const hasMultipleAssets = invoke_data && invoke_data.some((cont) => cont.amounts.length > 1);

  const amount = fromGroths(fee_only ? fee : value);
  const sign = getSign(income) ?? '';
  const name = truncate(target?.metadata_pairs.UN) ?? '';
  const label = `${sign}${amount} ${name}`;

  const multipleAssetsTitle = () => {
    let title = '';
    invoke_data.forEach((i) => i.amounts.forEach((a) => {
      const tg = assets.find(({ asset_id: id }) => id === a.asset_id);
      const n = truncate(tg?.metadata_pairs.UN) ?? '';
      const am = fromGroths(fee_only ? fee : a.amount);
      if (!isBalanceHidden) {
        title += `${am > 0 ? `+ ${am}` : `- ${Math.abs(am)}`} ${n} `;
      } else {
        title += `${n} `;
      }
    }));
    return title;
  };

  const assetRate = useMemo(() => {
    let rate = data?.rates.find((a) => a.from === data.asset_id && a.to === 'usd');

    if (!rate && data.invoke_data?.length && data.invoke_data[0].amounts.length === 1) {
      rate = data?.rates.find((a) => a.from === data.invoke_data[0].amounts[0].asset_id && a.to === 'usd');
    } else if (!rate && data.invoke_data?.length && data.invoke_data[0].amounts.length === 0) {
      rate = data?.rates.find((a) => a.from === 0 && a.to === 'usd');
    }

    return rate;
  }, [data]);

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
          <AmountStyled>{isBalanceHidden ? name : label}</AmountStyled>
          {assetRate ? (
            <Rate value={amount} income={income} txRate={fromGroths(assetRate.rate)} className={rateStyle} />
          ) : null}
        </ContainerStyled>
      ) : (
        <ContainerStyled>
          <MultipleAssets>
            {invoke_data.map((i) => i.amounts
              .slice()
              .reverse()
              .map((a) => <AssetIcon key={a.asset_id} asset_id={a.asset_id} />))}
          </MultipleAssets>
          <AmountStyled>{multipleAssetsTitle()}</AmountStyled>
          {assetRate ? (
            <Rate
              value={multipleAssetsAmount()}
              txRate={fromGroths(assetRate.rate)}
              income={income}
              className={rateStyle}
            />
          ) : null}
        </ContainerStyled>
      )}
      <StatusLabel data={data} />
      <TransactionBottom>
        <TransactionSource>{data.appname ?? 'Wallet'}</TransactionSource>
        <TransactionDate>{getTransactionDate()}</TransactionDate>
      </TransactionBottom>
    </>
  );
};

export default TransactionItem;
