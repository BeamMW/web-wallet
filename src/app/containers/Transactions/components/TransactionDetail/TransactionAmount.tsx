import React, { useMemo } from 'react';

import { fromGroths, toUSD } from '@core/utils';
import { AssetLabel } from '@app/shared/components';
import { InformationItem } from '@app/shared/components/DetailInformationLayout';
import { Rate, TransactionDetail } from '@core/types';
import { styled } from '@linaria/react';

const MultipleAssetsWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

interface TransactionAmountProps {
  transactionDetail: TransactionDetail;
  isBalanceHidden: boolean;
  assetRate: Rate;
  multipleAssetsTitle: () => string;
}

export const TransactionAmount = ({
  transactionDetail,
  isBalanceHidden,
  assetRate,
  multipleAssetsTitle,
}: TransactionAmountProps) => {
  const amount = useMemo(() => {
    const renderMultipleAssets = () => (
      <MultipleAssetsWrapper>
        {transactionDetail.invoke_data.map((i) => i.amounts.map((a) => (
          <AssetLabel
            value={a.amount}
            asset_id={a.asset_id}
            comment=""
            iconClass="without-transform"
            showRate={false}
            isBalanceHidden={isBalanceHidden}
            className="direction-row"
          />
        )))}
      </MultipleAssetsWrapper>
    );

    const renderAmountComment = (value, rate) => (
      <div className="amount-comment">
        {rate
          ? `${toUSD(
            fromGroths(value),
            fromGroths(rate),
          )} (calculated with the exchange rate at the time of the transaction)`
          : 'Exchange rate was not available at the time of transaction'}
      </div>
    );

    const renderAssetLabel = (a, asset_id, income) => (
      <AssetLabel
        value={a}
        asset_id={asset_id}
        comment=""
        className={`asset-label ${income ? 'income' : 'outcome'}`}
        iconClass="iconClass"
        showRate={false}
        isBalanceHidden={isBalanceHidden}
      />
    );

    if (transactionDetail.invoke_data?.length && transactionDetail.invoke_data[0].amounts.length > 1) {
      return (
        <InformationItem asset_id={transactionDetail.asset_id ?? 0}>
          <div className="title">Amount:</div>
          <div className="value asset mlt-asset">{renderMultipleAssets()}</div>
        </InformationItem>
      );
    }
    if (transactionDetail.invoke_data?.length && transactionDetail.invoke_data[0].amounts.length === 1) {
      const invokeData = transactionDetail.invoke_data[0].amounts[0];
      return (
        <InformationItem asset_id={invokeData.asset_id}>
          <div className="title">Amount:</div>
          <div className="value asset">
            {renderAssetLabel(Math.abs(invokeData.amount), invokeData.asset_id, transactionDetail.income)}
            {renderAmountComment(transactionDetail.value, assetRate?.rate)}
          </div>
        </InformationItem>
      );
    }
    if (transactionDetail.value) {
      return (
        <InformationItem asset_id={transactionDetail.asset_id}>
          <div className="title">Amount:</div>
          <div className="value asset">
            {renderAssetLabel(transactionDetail.value, transactionDetail.asset_id, transactionDetail.income)}
            {renderAmountComment(transactionDetail.value, assetRate?.rate)}
          </div>
        </InformationItem>
      );
    }
    return null;
  }, [transactionDetail, isBalanceHidden, assetRate?.rate, multipleAssetsTitle]);

  return <>{amount}</>;
};
