import React from 'react';
import { Section, WalletActions, Window } from '@app/shared/components';
import { useSelector } from 'react-redux';
import { selectAssets } from '@app/containers/Wallet/store/selectors';
import { selectIsBalanceHidden } from '@app/shared/store/selectors';
import { Assets } from '../../../Wallet/components/Wallet';

const AssetsList = () => {
  const isBalanceHidden = useSelector(selectIsBalanceHidden());
  const assets = useSelector(selectAssets());

  return (
    <Window title="Assets">
      <WalletActions />
      <Section title="">
        <Assets data={assets} isBalanceHidden={isBalanceHidden} />
      </Section>
    </Window>
  );
};

export default AssetsList;
