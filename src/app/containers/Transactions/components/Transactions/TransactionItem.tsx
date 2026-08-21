// @ts-nocheck
import React, { useMemo } from 'react';
import { styled } from '@linaria/react';
import { Transaction } from '@core/types';
import { Rate, StatusLabel, AssetIcon } from '@app/shared/components';
import { css } from '@linaria/core';
import {
  convertLowAmount, fromGroths, getSign, truncate,
} from '@core/utils';
import { AssetTotal } from '@app/containers/Wallet/interfaces';

const Row = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
`;

const Left = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
  flex: 1;
`;

const Right = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
  gap: 6px;
  flex: 0 0 auto;
`;

const IconWrap = styled.div`
  width: 34px;
  height: 34px;
  clip-path: var(--cp-clip-sm);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--cp-line);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 34px;
`;

const iconResetClass = css`
  margin-right: 0 !important;
  transform: none !important;
  top: auto !important;
`;

const MultiIconWrap = styled.div`
  position: relative;
  width: 34px;
  height: 26px;
`;

const MultiPos1 = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0.85;
`;

const MultiPos2 = styled.div`
  position: absolute;
  top: 0;
  left: 9px;
  opacity: 0.95;
`;

const MultiPos3 = styled.div`
  position: absolute;
  top: 0;
  left: 18px;
`;

const Title = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: var(--cp-text);
  line-height: 1.2;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TopLine = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`;

const DateLine = styled.div`
  margin-top: 8px;
  text-align: start;
`;

const MetaText = styled.div`
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.02em;
  color: var(--cp-muted);
  white-space: nowrap;
`;

const AmountText = styled.div<{ tone: 'in' | 'out' | 'neutral' }>`
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: ${({ tone }) => {
    switch (tone) {
      case 'in':
        return 'var(--cp-accent-3)';
      case 'out':
        return 'var(--cp-accent-2)';
      default:
        return 'var(--cp-text)';
    }
  }};
`;

const rateStyle = css`
  margin: 0 !important;
  opacity: 0.75;
  font-size: 12px;
  white-space: nowrap;
`;

const multipleAssetsTitle = () => 'Multiple assets';

const multipleAssetsAmount = (invoke_data, fee_only, fee) => {
  let res = 0;

  invoke_data.forEach((i) => i.amounts.forEach((a) => {
    const am = fromGroths(fee_only ? fee : a.amount);

    if (am > res) res = am;
  }));
  return res;
};

const getTransactionDate = (create_time: number) => {
  const txDate = new Date(create_time * 1000);
  const time = txDate.toLocaleTimeString(undefined, { timeStyle: 'short' });
  const date = txDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  return { date, time };
};

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
    asset_id, invoke_data, income, fee, fee_only, value, create_time,
  } = data;

  const target = assets.find(({ asset_id: id }) => id === asset_id);

  const hasMultipleAssets = invoke_data && invoke_data.some((cont) => cont.amounts.length > 1);

  const amount = fromGroths(fee_only ? fee : value);
  const sign = getSign(income) ?? '';
  const name = truncate(target?.metadata_pairs.UN) ?? '';

  const assetRate = useMemo(() => {
    let rate = data?.rates.find((a) => a.from === data.asset_id && a.to === 'usd');

    if (!rate && data.invoke_data?.length && data.invoke_data[0].amounts.length === 1) {
      rate = data?.rates.find((a) => a.from === data.invoke_data[0].amounts[0].asset_id && a.to === 'usd');
    } else if (!rate && data.invoke_data?.length && data.invoke_data[0].amounts.length === 0) {
      rate = data?.rates.find((a) => a.from === 0 && a.to === 'usd');
    }

    return rate;
  }, [data]);

  const { date, time } = getTransactionDate(create_time);
  const appLabel = data.appname ?? 'Wallet';
  let tone: 'in' | 'out' | 'neutral' = 'neutral';
  if (!data.status_string.includes('self')) {
    tone = income ? 'in' : 'out';
  }

  const amountLabel = hasMultipleAssets
    ? `${sign}${convertLowAmount(Math.abs(multipleAssetsAmount(invoke_data, fee_only, fee)))}`
    : `${sign}${convertLowAmount(amount)}`;
  const assetLabel = hasMultipleAssets ? '' : name;
  const rightAmount = isBalanceHidden ? '••••••' : `${amountLabel}${assetLabel ? ` ${assetLabel}` : ''}`;

  const multiAssetIds = useMemo(() => {
    if (!invoke_data) return [];
    const ids = new Set<number>();
    invoke_data.forEach((c) => (c.amounts || []).forEach((a) => ids.add(a.asset_id)));
    return Array.from(ids).slice(0, 3);
  }, [invoke_data]);

  return (
    <Row>
      <Left>
        <IconWrap>
          {hasMultipleAssets ? (
            <MultiIconWrap>
              {multiAssetIds[0] !== undefined ? (
                <MultiPos1>
                  <AssetIcon asset_id={multiAssetIds[0]} className={iconResetClass} />
                </MultiPos1>
              ) : null}
              {multiAssetIds[1] !== undefined ? (
                <MultiPos2>
                  <AssetIcon asset_id={multiAssetIds[1]} className={iconResetClass} />
                </MultiPos2>
              ) : null}
              {multiAssetIds[2] !== undefined ? (
                <MultiPos3>
                  <AssetIcon asset_id={multiAssetIds[2]} className={iconResetClass} />
                </MultiPos3>
              ) : null}
            </MultiIconWrap>
          ) : (
            <AssetIcon asset_id={data.asset_id} className={iconResetClass} />
          )}
        </IconWrap>

        <div style={{ minWidth: 0 }}>
          <TopLine>
            <Title>{hasMultipleAssets ? multipleAssetsTitle() : appLabel}</Title>
            <StatusLabel data={data} />
          </TopLine>
          <DateLine>
            <MetaText>
              {date}
              {' · '}
              {time}
            </MetaText>
          </DateLine>
        </div>
      </Left>

      <Right>
        <AmountText tone={tone}>{rightAmount}</AmountText>
        {assetRate && !isBalanceHidden ? (
          <Rate
            value={hasMultipleAssets ? multipleAssetsAmount(invoke_data, fee_only, fee) : amount}
            txRate={fromGroths(assetRate.rate)}
            income={income}
            className={rateStyle}
          />
        ) : null}
      </Right>
    </Row>
  );
};

export default TransactionItem;
