import React from 'react';
import { styled } from '@linaria/react';
import { TransactionDetail } from '@core/types';
import { compact, copyToClipboard } from '@core/utils';
import { Button } from '@app/shared/components';
import { CopySmallIcon } from '@app/shared/icons';

const GeneralTransactionWrapper = styled.div`
  text-align: left;
`;

const InformationItem = styled.div`
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
}

const GeneralTransactionInformation = ({ transactionDetail }: GeneralTransactionInformationProps) => {
  const copyAddress = async (value: string) => {
    await copyToClipboard(value);
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
              onClick={() => copyAddress(transactionDetail.sender)}
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
              onClick={() => copyAddress(transactionDetail.receiver)}
            />
          </div>
        </InformationItem>
      )}

      <InformationItem>
        <div className="title">Comment:</div>
        <div className="value">{transactionDetail.comment}</div>
      </InformationItem>

      <InformationItem>
        <div className="title">Transaction Id:</div>
        <div className="value">{transactionDetail.txId}</div>
      </InformationItem>

      {transactionDetail.kernel && (
        <InformationItem>
          <div className="title">kernel Id:</div>
          <div className="value">{transactionDetail.kernel}</div>
        </InformationItem>
      )}
    </GeneralTransactionWrapper>
  );
};

export default GeneralTransactionInformation;
