import React from 'react';
import { PaymentProof } from '@core/types';
import { styled } from '@linaria/react';

import { compact, copyToClipboard } from '@core/utils';
import { Button } from '@app/shared/components';
import { CopySmallIcon, ExternalLink } from '@app/shared/icons';
import config from '@app/config';
import { InformationItem } from './GeneralTransactionInformation';
import AssetLabel from '../../../../shared/components/AssetLabel';

interface PaymentProofInformationInterface {
  paymentProof: PaymentProof;
  isBalanceHidden: boolean;
  // rate: number;
}

const PaymentProofWrapper = styled.div`
  text-align: left;
`;

const PaymentProofInformation = ({ paymentProof, isBalanceHidden }: PaymentProofInformationInterface) => {
  const copyAddress = async (value: string) => {
    await copyToClipboard(value);
  };
  return (
    <PaymentProofWrapper>
      <InformationItem>
        <div className="title">Sending Address:</div>
        <div className="value">
          <p>{compact(paymentProof.sender, 16)}</p>
          <Button
            variant="icon"
            pallete="white"
            icon={CopySmallIcon}
            onClick={() => copyAddress(paymentProof.sender)}
          />
        </div>
      </InformationItem>
      <InformationItem>
        <div className="title">Receiving Address:</div>
        <div className="value">
          <p>
            {' '}
            {compact(paymentProof.receiver, 16)}
          </p>
          <Button
            variant="icon"
            pallete="white"
            icon={CopySmallIcon}
            onClick={() => copyAddress(paymentProof.receiver)}
          />
        </div>
      </InformationItem>

      <InformationItem asset_id={paymentProof.asset_id}>
        <div className="title">Amount:</div>
        <div className="value asset">
          <AssetLabel
            value={paymentProof.amount}
            asset_id={paymentProof.asset_id}
            comment=""
            className="asset-label"
            iconClass="iconClass"
            showRate={false}
            isBalanceHidden={isBalanceHidden}
          />
          {/* <div className="amount-comment">
          {toUSD(fromGroths(paymentProof.amount), rate)}
          (сalculated with the exchange rate at the current time)
        </div> */}
        </div>
      </InformationItem>

      <InformationItem>
        <div className="title">Kernel id:</div>
        <div className="value">
          <p>{paymentProof.kernel}</p>
          <Button
            variant="icon"
            pallete="white"
            icon={ExternalLink}
            onClick={() => window.open(config.explorer_url + paymentProof.kernel)}
          />
        </div>
      </InformationItem>
    </PaymentProofWrapper>
  );
};

export default PaymentProofInformation;
