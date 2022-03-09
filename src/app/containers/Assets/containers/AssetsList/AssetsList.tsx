import React, { useCallback } from 'react';
import { Section, WalletActions, Window } from '@app/shared/components';
import { useSelector } from 'react-redux';
import { selectAssets } from '@app/containers/Wallet/store/selectors';
import { selectIsBalanceHidden } from '@app/shared/store/selectors';
import { ROUTES } from '@app/shared/constants';
import { useNavigate } from 'react-router-dom';
import { Assets } from '../../../Wallet/components/Wallet';

const AssetsList = () => {
  const navigate = useNavigate();
  const isBalanceHidden = useSelector(selectIsBalanceHidden());
  const assets = useSelector(selectAssets());

  const navigateToAssets = useCallback(() => {
    navigate(ROUTES.WALLET.BASE);
  }, [navigate]);

  return (
    <Window title="Assets" showHideButton onPrevious={navigateToAssets}>
      <WalletActions />
      <Section title="">
        <Assets data={assets} isBalanceHidden={isBalanceHidden} />
      </Section>
    </Window>
  );
};

export default AssetsList;
