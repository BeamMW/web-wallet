import React, { useCallback, useEffect } from 'react';

import { Window, Section, WalletActions } from '@app/shared/components';

import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@app/shared/constants';
import { useDispatch, useSelector } from 'react-redux';
import { selectAssets, selectAssetsInfo, selectRate } from '@app/containers/Wallet/store/selectors';

import { loadRate, getAssetInfo, getAssetList } from '@app/containers/Wallet/store/actions';
import { TransactionList } from '@app/containers/Transactions';
import { createdComparator } from '@core/utils';
import { selectTransactions } from '@app/containers/Transactions/store/selectors';
import { selectIsBalanceHidden, selectAssetSync } from '@app/shared/store/selectors';
import { Assets } from '../../components/Wallet';

const TXS_MAX = 4;

const Wallet = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const assets = useSelector(selectAssets());
  const assets_info = useSelector(selectAssetsInfo());
  const transactions = useSelector(selectTransactions());
  const isBalanceHidden = useSelector(selectIsBalanceHidden());
  const isAssetSynced = useSelector(selectAssetSync());
  const rate = useSelector(selectRate());

  useEffect(() => {
    const a = assets
      .filter((item1) => !assets_info.some((item2) => item2.asset_id === item1.asset_id))
      .filter((ass) => ass.asset_id !== 0);

    if (a.length > 0) {
      a.forEach((asset) => {
        dispatch(getAssetInfo.request(asset.asset_id));
      });
    }
  }, [assets_info, assets, dispatch]);

  useEffect(() => {
    dispatch(getAssetList.request({ refresh: !isAssetSynced }));
  }, [dispatch, isAssetSynced]);

  useEffect(() => {
    if (!rate) {
      dispatch(loadRate.request());
    }
  }, [dispatch, rate]);

  const sorted = transactions.slice().sort(createdComparator);
  const txs = sorted.slice(0, TXS_MAX);
  const assts = assets.slice(0, TXS_MAX);

  const navigateToTransactions = useCallback(() => {
    navigate(ROUTES.TRANSACTIONS.BASE);
  }, [navigate]);

  const navigateToAssets = useCallback(() => {
    navigate(ROUTES.ASSETS.BASE);
  }, [navigate]);

  return (
    <Window title="Wallet" primary showHideButton>
      <WalletActions />
      <Section title="Assets" showAllAction={assets.length > TXS_MAX ? navigateToAssets : undefined}>
        <Assets data={assts} isBalanceHidden={isBalanceHidden} />
      </Section>

      <Section title="Transactions" showAllAction={sorted.length > TXS_MAX ? navigateToTransactions : undefined}>
        <TransactionList data={txs} isBalanceHidden={isBalanceHidden} />
      </Section>
    </Window>
  );
};

export default Wallet;
