import React, { useCallback, useMemo, useState } from 'react';
import { Section, WalletActions, Window } from '@app/shared/components';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAssets } from '@app/containers/Wallet/store/selectors';
import { Assets } from '@app/containers/Wallet/components/Wallet';
import { selectIsBalanceHidden } from '@app/shared/store/selectors';
import { TransactionList } from '@app/containers/Transactions';
import { selectTransactions } from '@app/containers/Transactions/store/selectors';
import { ROUTES } from '@app/shared/constants';

const AssetDetail = () => {
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();
  const params = useParams();
  const assets = useSelector(selectAssets());
  const transactions = useSelector(selectTransactions());
  const isBalanceHidden = useSelector(selectIsBalanceHidden());

  const currentAsset = useMemo(() => assets.find((a) => a.asset_id.toString() === params?.id), [params?.id, assets]);

  const filtered = transactions.filter((tx) => tx.asset_id.toString() === params?.id);
  const txs = showAll ? filtered : filtered.slice(0, 4);

  const showFullTxList = useCallback(() => {
    setShowAll((v) => !v);
  }, [setShowAll]);

  const navigateToAssets = useCallback(() => {
    navigate(ROUTES.ASSETS.BASE);
  }, [navigate]);

  return (
    <Window title={currentAsset?.metadata_pairs.UN} showHideButton onPrevious={navigateToAssets}>
      <WalletActions />
      <Section title="">
        <Assets data={[currentAsset]} isBalanceHidden={isBalanceHidden} />
      </Section>
      <Section title="Transactions" showAllAction={filtered.length > 4 && !showAll ? showFullTxList : undefined}>
        <TransactionList data={txs} isBalanceHidden={isBalanceHidden} />
      </Section>
    </Window>
  );
};

export default AssetDetail;
