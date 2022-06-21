import React, { useCallback, useMemo } from 'react';
import { styled } from '@linaria/react';
import { Rate, TransactionDetail } from '@core/types';
import {
  compact, fromGroths, getTxType, toUSD, truncate,
} from '@core/utils';
import { Button } from '@app/shared/components';
import { CopySmallIcon, ExternalLink } from '@app/shared/icons';
import AssetLabel from '@app/shared/components/AssetLabel';
import { MultipleAssets } from '@app/containers/Transactions/components/Transactions/TransactionItem';
import { AssetTotal } from '@app/containers/Wallet/interfaces';
import config from '@app/config';

import { InformationItem } from '@app/shared/components/DetailInformationLayout';
import AssetIcon from '../../../../shared/components/AssetIcon';

const GeneralTransactionWrapper = styled.div`
  text-align: left;
`;

interface GeneralTransactionInformationProps {
  transactionDetail: TransactionDetail;
  // rate: number;
  assets: AssetTotal[];
  isBalanceHidden: boolean;
  copy: (value: string, tM: string) => void;
  assetRate: Rate;
  feeRate: Rate;
}

const GeneralTransactionInformation = ({
  transactionDetail,
  assets,
  isBalanceHidden,
  copy,
  assetRate,
  feeRate,
}: GeneralTransactionInformationProps) => {
  const multipleAssetsTitle = useCallback(() => {
    let title = '';
    transactionDetail.invoke_data?.forEach((i) => i.amounts.forEach((a) => {
      const tg = assets.find(({ asset_id: id }) => id === a.asset_id);
      const n = truncate(tg?.metadata_pairs.UN) ?? '';
      const am = fromGroths(transactionDetail.fee_only ? transactionDetail.fee : a.amount);
      if (!isBalanceHidden) {
        title += `${am > 0 ? `+ ${am}` : `- ${Math.abs(am)}`} ${n} `;
      } else {
        title += `${n} `;
      }
    }));
    return title;
  }, [transactionDetail, assets, isBalanceHidden]);

  const getTransactionDate = () => {
    const txDate = new Date(transactionDetail.create_time * 1000);
    const time = txDate.toLocaleTimeString(undefined, { timeStyle: 'short' });
    const date = txDate.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    return (
      <>
        <span>{date}</span>
        <span>{time}</span>
      </>
    );
  };

  // const multipleAssetsAmount = () => {
  //   let res = 0;
  //
  //   transactionDetail.invoke_data?.forEach((i) => i.amounts?.forEach((a) => {
  //     const am = fromGroths(transactionDetail.fee_only ? transactionDetail.fee : a.amount);
  //
  //     if (am > res) res = am;
  //   }));
  //   return res;
  // };

  const amount = useMemo(() => {
    if (transactionDetail.invoke_data?.length && transactionDetail.invoke_data[0].amounts.length > 1) {
      return (
        <InformationItem asset_id={transactionDetail.asset_id ?? 0}>
          <div className="title">Amount:</div>
          <div className="value asset mlt-asset">
            <MultipleAssets className="multi-asset">
              {transactionDetail.invoke_data?.map((i) => i.amounts
                .slice()
                .reverse()
                .map((a) => <AssetIcon key={a.asset_id} asset_id={a.asset_id} />))}
            </MultipleAssets>
            <span className="multi-asset-title">{multipleAssetsTitle()}</span>
            {/* <div className="amount-comment">
              {toUSD(fromGroths(multipleAssetsAmount()), rate)}
              (сalculated with the exchange rate at the current time)
            </div> */}
          </div>
        </InformationItem>
      );
    }
    if (transactionDetail.invoke_data?.length && transactionDetail.invoke_data[0].amounts.length === 1) {
      return (
        <InformationItem asset_id={transactionDetail.invoke_data[0].amounts[0].asset_id}>
          <div className="title">Amount:</div>
          <div className="value asset">
            <AssetLabel
              value={Math.abs(transactionDetail.invoke_data[0].amounts[0].amount)}
              asset_id={transactionDetail.invoke_data[0].amounts[0].asset_id}
              comment=""
              className={`asset-label ${transactionDetail.income ? 'income' : 'outcome'}`}
              iconClass="iconClass"
              showRate={false}
              isBalanceHidden={isBalanceHidden}
            />
            <div className="amount-comment">
              {assetRate?.rate
                ? `${toUSD(fromGroths(transactionDetail.value), fromGroths(assetRate?.rate))} `
                  + '(сalculated with the exchange rate at the time of the transaction)'
                : 'Exchange rate was not available at the time of transaction'}
            </div>
          </div>
        </InformationItem>
      );
    }
    return transactionDetail.value ? (
      <InformationItem asset_id={transactionDetail.asset_id}>
        <div className="title">Amount:</div>
        <div className="value asset">
          <AssetLabel
            value={transactionDetail.value}
            asset_id={transactionDetail.asset_id}
            comment=""
            className={`asset-label ${transactionDetail.income ? 'income' : 'outcome'}`}
            iconClass="iconClass"
            showRate={false}
            isBalanceHidden={isBalanceHidden}
          />
          <div className="amount-comment">
            {assetRate?.rate
              ? `${toUSD(fromGroths(transactionDetail.value), fromGroths(assetRate?.rate))} `
                + '(сalculated with the exchange rate at the time of the transaction)'
              : 'Exchange rate was not available at the time of transaction'}
          </div>

          {transactionDetail.asset_id !== 0 && (
            <div className="confidential-id">
              <div className="confidential-id-label">Confidential asset ID:</div>
              <div className="confidential-id-value">
                <div className="val">{transactionDetail.asset_id}</div>
                <Button
                  variant="icon"
                  pallete="white"
                  icon={ExternalLink}
                  onClick={() => window.open(config.explorer_url_confidential_id + transactionDetail.asset_id)}
                />
              </div>
            </div>
          )}
        </div>
      </InformationItem>
    ) : null;
  }, [transactionDetail, isBalanceHidden, assetRate?.rate, multipleAssetsTitle]);

  return (
    <GeneralTransactionWrapper>
      <InformationItem>
        <div className="title">Date:</div>
        <div className="value">{getTransactionDate()}</div>
      </InformationItem>
      {!!transactionDetail.sender && (
        <InformationItem>
          <div className="title">Sending address:</div>
          <div className="value">
            <p>{compact(transactionDetail.sender, 16)}</p>
            <Button
              variant="icon"
              pallete="white"
              icon={CopySmallIcon}
              onClick={() => copy(transactionDetail.sender, 'Address copied to clipboard')}
            />
          </div>
        </InformationItem>
      )}
      {!!transactionDetail.receiver && (
        <InformationItem>
          <div className="title">Receiving address:</div>
          <div className="value">
            <p>{compact(transactionDetail.receiver, 16)}</p>
            <Button
              variant="icon"
              pallete="white"
              icon={CopySmallIcon}
              onClick={() => copy(transactionDetail.receiver, 'Address copied to clipboard')}
            />
          </div>
        </InformationItem>
      )}

      {transactionDetail.address_type && transactionDetail.tx_type === 7 ? (
        <InformationItem>
          <div className="title">Address type:</div>
          <div className="value">
            <p>{getTxType(transactionDetail.address_type, transactionDetail.address_type === 'offline')}</p>
          </div>
        </InformationItem>
      ) : (
        <InformationItem>
          <div className="title">Address type:</div>
          <div className="value">
            <p>Regular</p>
          </div>
        </InformationItem>
      )}

      {amount}

      {transactionDetail.fee > 0 && (
        <InformationItem asset_id={0}>
          <div className="title">Fee:</div>
          <div className="value asset">
            <AssetLabel
              value={transactionDetail.fee}
              asset_id={0}
              comment=""
              className="asset-label fee"
              iconClass="iconClass"
              showRate={false}
              isBalanceHidden={isBalanceHidden}
            />
            <div className="amount-comment">
              {feeRate?.rate
                ? toUSD(fromGroths(transactionDetail.fee), fromGroths(feeRate?.rate))
                : 'Exchange rate was not available at the time of transaction'}
            </div>
          </div>
        </InformationItem>
      )}

      <InformationItem>
        <div className="title">Source:</div>
        <div className="value">{transactionDetail.appname ?? 'Wallet'}</div>
      </InformationItem>

      {transactionDetail.comment && (
        <InformationItem>
          <div className="title">Comment:</div>
          <div className="value">{transactionDetail.comment}</div>
        </InformationItem>
      )}

      <InformationItem>
        <div className="title">Transaction Id:</div>
        <div className="value">
          <p>{transactionDetail.txId}</p>
          <Button
            variant="icon"
            pallete="white"
            icon={CopySmallIcon}
            onClick={() => copy(transactionDetail.txId, 'TxId copied to clipboard')}
          />
        </div>
      </InformationItem>

      {transactionDetail.kernel && (
        <InformationItem>
          <div className="title">kernel Id:</div>
          <div className="value">
            <p>{transactionDetail.kernel}</p>
            <Button
              variant="icon"
              pallete="white"
              icon={ExternalLink}
              onClick={() => window.open(config.explorer_url + transactionDetail.kernel)}
            />
          </div>
        </InformationItem>
      )}
    </GeneralTransactionWrapper>
  );
};

export default GeneralTransactionInformation;
