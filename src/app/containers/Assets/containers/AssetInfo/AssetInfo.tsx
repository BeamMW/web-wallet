import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Window } from '@app/shared/components';
import { selectAssets } from '@app/containers/Wallet/store/selectors';
import { DetailInfoWrapper, DetailTabs } from '@app/shared/components/DetailInformationLayout';

import { AssetBalance } from '@app/containers/Assets/components';

const AssetInfo = () => {
  const params = useParams();
  const assets = useSelector(selectAssets());
  const [activeTab, setActiveTab] = useState('balance');

  const currentAsset = useMemo(() => assets.find((a) => a.asset_id.toString() === params?.id), [params?.id, assets]);

  const handleButton = (e: { keyCode: number }) => {
    if (e.keyCode === 9) {
      if (activeTab === 'balance') {
        setActiveTab('asset_info');
      } else {
        setActiveTab('balance');
      }
    }
  };

  return (
    <Window title={currentAsset?.metadata_pairs.UN} showHideButton>
      <DetailTabs>
        <div
          role="link"
          className={`transaction-item ${activeTab === 'balance' ? 'active' : ''}`}
          onClick={() => setActiveTab('balance')}
          onKeyDown={handleButton}
          tabIndex={0}
        >
          Balance
        </div>

        <div
          role="link"
          className={`transaction-item ${activeTab === 'asset_info' ? 'active' : ''}`}
          onClick={() => setActiveTab('asset_info')}
          onKeyDown={handleButton}
          tabIndex={-1}
        >
          Asset Info
        </div>
      </DetailTabs>
      <DetailInfoWrapper>
        {currentAsset && activeTab === 'balance' && <AssetBalance currentAsset={currentAsset} />}
      </DetailInfoWrapper>
    </Window>
  );
};

export default AssetInfo;
