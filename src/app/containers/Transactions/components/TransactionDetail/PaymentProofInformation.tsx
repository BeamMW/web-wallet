import React from 'react';
import { PaymentProof } from '@core/types';
import { styled } from '@linaria/react';

import { compact } from '@core/utils';
import { Button } from '@app/shared/components';
import { CopySmallIcon, ExternalLink } from '@app/shared/icons';
import config from '@app/config';
import { InformationItem } from './GeneralTransactionInformation';
import AssetLabel from '../../../../shared/components/AssetLabel';

interface PaymentProofInformationInterface {
  paymentProof: PaymentProof;
  isBalanceHidden: boolean;
  copy: (value: string, tM: string) => void;
  // rate: number;
}

const PaymentProofWrapper = styled.div`
  text-align: left;
`;

const PaymentProofInformation = ({ paymentProof, isBalanceHidden, copy }: PaymentProofInformationInterface) => (
  <PaymentProofWrapper>
    <InformationItem>
      <div className="title">Sending Address:</div>
      <div className="value">
        <p>{compact(paymentProof.sender, 16)}</p>
        <Button
          variant="icon"
          pallete="white"
          icon={CopySmallIcon}
          onClick={() => copy(paymentProof.sender, 'Address copied to clipboard')}
        />
      </div>
    </InformationItem>
    <InformationItem>
      <div className="title">Receiving Address:</div>
      <div className="value">
        <p>{compact(paymentProof.receiver, 16)}</p>
        <Button
          variant="icon"
          pallete="white"
          icon={CopySmallIcon}
          onClick={() => copy(paymentProof.receiver, 'Address copied to clipboard')}
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

    <InformationItem>
      <div className="title">Code:</div>
      <div className="value">
        <p>{paymentProof.payment_proof}</p>
        <Button
          variant="icon"
          pallete="white"
          icon={CopySmallIcon}
          onClick={() => copy(paymentProof.payment_proof, 'Code copied to clipboard')}
        />
      </div>
    </InformationItem>
  </PaymentProofWrapper>
);

export default PaymentProofInformation;
