import React from 'react';
import { PaymentProof } from '@core/types';
import { styled } from '@linaria/react';

import { compact } from '@core/utils';
import AssetLabel from '../../../../shared/components/AssetLabel';
import { InformationItem } from './GeneralTransactionInformation';

interface PaymentProofInformationInterface {
  paymentProof: PaymentProof;
  // rate: number;
}

const PaymentProofWrapper = styled.div`
  text-align: left;
`;

const PaymentProofInformation = ({ paymentProof }: PaymentProofInformationInterface) => (
  <PaymentProofWrapper>
    <InformationItem>
      <div className="title">Sending Address:</div>
      <div className="value">{compact(paymentProof.sender, 16)}</div>
    </InformationItem>
    <InformationItem>
      <div className="title">Receiving Address:</div>
      <div className="value">{compact(paymentProof.receiver, 16)}</div>
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
        />
        {/* <div className="amount-comment">
          {toUSD(fromGroths(paymentProof.amount), rate)}
          (сalculated with the exchange rate at the current time)
        </div> */}
      </div>
    </InformationItem>
    <InformationItem>
      <div className="title">Kernel id:</div>
      <div className="value">{paymentProof.kernel}</div>
    </InformationItem>
  </PaymentProofWrapper>
);

export default PaymentProofInformation;
