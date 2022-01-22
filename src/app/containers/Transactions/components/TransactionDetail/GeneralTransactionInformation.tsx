import React from 'react';
import { styled } from '@linaria/react';
import { TransactionDetail, WalletTotal } from '@core/types';
import { compact, fromGroths, truncate } from '@core/utils';
import { Button } from '@app/shared/components';
import { CopySmallIcon, ExternalLink } from '@app/shared/icons';
import { PALLETE_ASSETS } from '@app/shared/constants';
import AssetLabel from '@app/shared/components/AssetLabel';
import { MultipleAssets } from '@app/containers/Transactions/components/Transactions/TransactionItem';
import { AssetTotal } from '@app/containers/Wallet/interfaces';
import config from '@app/config';

import AssetIcon from '../../../../shared/components/AssetIcon';

interface AssetIconProps extends Partial<WalletTotal> {
  asset_id?: number;
  className?: string;
}

const GeneralTransactionWrapper = styled.div`
  text-align: left;
`;

export const InformationItem = styled.div<AssetIconProps>`
  margin-bottom: 30px;
  .title {
    opacity: 0.5;
    font-size: 14px;
    font-weight: bold;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: 1px;
    color: #fff;
    text-transform: uppercase;
  }
  .value {
    display: flex;
    margin: 10px 0 0;
    font-size: 14px;
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: normal;
    color: #fff;
    align-items: center;
    word-break: break-word;

    .asset-label {
      align-items: center;
      .iconClass {
        position: relative;
      }
      .asset-name {
        color: ${({ asset_id }) => (PALLETE_ASSETS[asset_id] ? PALLETE_ASSETS[asset_id] : PALLETE_ASSETS[asset_id % PALLETE_ASSETS.length])};
      }
    }

    &.asset {
      display: block;
      .amount-comment {
        font-size: 12px;
        font-weight: normal;
        font-stretch: normal;
        font-style: normal;
        line-height: normal;
        letter-spacing: normal;
        color: #fff;
        opacity: 0.5;
        margin-left: 36px;
      }
      .multi-asset {
        margin-left: 0;
      }
      .multi-asset-title {
        margin-left: 36px;
        &::after {
          content: '';
          padding: 0;
        }
      }
    }

    > p {
      width: 90%;
      margin: 0;
      display: inline-block;
    }

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
  }
`;

interface GeneralTransactionInformationProps {
  transactionDetail: TransactionDetail;
  // rate: number;
  assets: AssetTotal[];
  isBalanceHidden: boolean;
  copy: (value: string, tM: string) => void;
}

const GeneralTransactionInformation = ({
  transactionDetail,
  assets,
  isBalanceHidden,
  copy,
}: GeneralTransactionInformationProps) => {
  const multipleAssetsTitle = () => {
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
  };

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
              onClick={() => copy(transactionDetail.sender, 'Sender copied to clipboard')}
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
              onClick={() => copy(transactionDetail.receiver, 'Receiver copied to clipboard')}
            />
          </div>
        </InformationItem>
      )}
      {transactionDetail.invoke_data?.length && (
        <InformationItem asset_id={transactionDetail.asset_id}>
          <div className="title">Amount:</div>
          <div className="value asset">
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
      )}

      {transactionDetail.value && (
        <InformationItem asset_id={transactionDetail.asset_id}>
          <div className="title">Amount:</div>
          <div className="value asset">
            <AssetLabel
              value={transactionDetail.value}
              asset_id={transactionDetail.asset_id}
              comment=""
              className="asset-label"
              iconClass="iconClass"
              showRate={false}
              isBalanceHidden={isBalanceHidden}
            />
            {/*   <div className="amount-comment">
              {toUSD(fromGroths(transactionDetail.value), rate)} (сalculated with the exchange rate at the current time)
            </div> */}
          </div>
        </InformationItem>
      )}

      {transactionDetail.fee && (
        <InformationItem asset_id={0}>
          <div className="title">Fee:</div>
          <div className="value asset">
            <AssetLabel
              value={transactionDetail.fee}
              asset_id={0}
              comment=""
              className="asset-label"
              iconClass="iconClass"
              showRate={false}
              isBalanceHidden={isBalanceHidden}
            />
            {/*   <div className="amount-comment">{toUSD(fromGroths(transactionDetail.fee), rate)}</div> */}
          </div>
        </InformationItem>
      )}

      {/*  <InformationItem>
        <div className="title">Source:</div>
        <div className="value">{transactionDetail.appname ?? 'Wallet'}</div>
      </InformationItem> */}

      {transactionDetail.comment && (
        <InformationItem>
          <div className="title">Comment:</div>
          <div className="value">{transactionDetail.comment}</div>
        </InformationItem>
      )}

      <InformationItem>
        <div className="title">Transaction Id:</div>
        <div className="value">
          <p>
            {' '}
            {transactionDetail.txId}
          </p>
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
