import React from 'react';
import { AssetTotal } from '@app/containers/Wallet/interfaces';
import { styled } from '@linaria/react';
import { Section } from '@app/shared/components';
import { InformationItem } from '@app/shared/components/DetailInformationLayout';
import { fromGroths } from '@core/utils';
import AssetLabel from '../../../../../shared/components/AssetLabel';
import Rate from '../../../../../shared/components/Rate';

interface AssetBalanceProps {
  currentAsset: AssetTotal;
}

const AssetBalanceWrapper = styled.div`
  margin: -30px 0;
  .asset-info {
    margin-left: 35px;
    margin-bottom: 30px;
  }
`;

const AssetBalance = ({ currentAsset }: AssetBalanceProps) => (
  <AssetBalanceWrapper>
    <Section variant="gray" title=" " defaultCollapseState={false}>
      <div className="asset-info">
        <AssetLabel value={currentAsset.available} asset_id={currentAsset.asset_id} isBalanceHidden />
      </div>
      <InformationItem>
        <div className="title">Available:</div>
        <div className="value">
          <div>
            {fromGroths(currentAsset.available)}
            {' '}
            {currentAsset.metadata_pairs.UN}
          </div>
          <br />
        </div>
        <Rate value={fromGroths(currentAsset.available)} income={false} />
      </InformationItem>
    </Section>
    <Section variant="gray" title=" ">
      <InformationItem>
        <div className="title">Locked:</div>
        <div className="value">
          <div>
            {fromGroths(currentAsset.sending)}
            {' '}
            {currentAsset.metadata_pairs.UN}
          </div>
          <br />
        </div>
        <Rate value={fromGroths(currentAsset.sending)} income={false} />
      </InformationItem>
    </Section>
  </AssetBalanceWrapper>
);

export default AssetBalance;
