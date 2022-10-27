import React from 'react';
import { PaymentProof, Rate, TransactionDetail } from '@core/types';
import { styled } from '@linaria/react';

import { compact, fromGroths, toUSD } from '@core/utils';
import { Button } from '@app/shared/components';
import { CopySmallIcon, ExternalLink } from '@app/shared/icons';
import config from '@app/config';
import { InformationItem } from '@app/shared/components/DetailInformationLayout';
import AssetLabel from '../../../../shared/components/AssetLabel';

interface PaymentProofInformationInterface {
  paymentProof: PaymentProof;
  isBalanceHidden: boolean;
  copy: (value: string, tM: string) => void;
  transactionDetail: TransactionDetail;
  assetRate: Rate;
}

const PaymentProofWrapper = styled.div`
  text-align: left;
`;

const PaymentProofInformation = ({
  paymentProof,
  isBalanceHidden,
  copy,
  transactionDetail,
  assetRate,
}: PaymentProofInformationInterface) => (
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
          className={`asset-label ${transactionDetail.income ? 'income' : 'outcome'}`}
          iconClass="iconClass"
          showRate={false}
          isBalanceHidden={isBalanceHidden}
        />
        <div className="amount-comment">
          {assetRate?.rate
            ? `${toUSD(fromGroths(paymentProof.amount), fromGroths(assetRate?.rate))} ` +
              '(сalculated with the exchange rate at the time of the transaction)'
            : 'Exchange rate was not available at the time of transaction'}
        </div>
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
