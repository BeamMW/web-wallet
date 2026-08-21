import React, { useCallback, useMemo, useState } from 'react';
import { Window } from '@app/shared/components';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectAssets } from '@app/containers/Wallet/store/selectors';
import { Assets } from '@app/containers/Wallet/components/Wallet';
import { selectIsBalanceHidden } from '@app/shared/store/selectors';
import { TransactionList } from '@app/containers/Transactions';
import { selectTransactions } from '@app/containers/Transactions/store/selectors';
import { ROUTES } from '@app/shared/constants';
import { truncate } from '@core/utils';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';
import { ArrowUpIcon, ArrowDownIcon, ArrowsTowards } from '@app/shared/icons';
import { setSelectedAssetId } from '@app/containers/Wallet/store/actions';

const PageWrap = styled.div`
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;

  :global(html[data-env='fullscreen']) & {
    max-width: 560px;
  }
`;

const QuickActions = styled.div`
  display: flex;
  gap: 9px;
`;

const ActionBtn = styled.button<{ accent: 'purple' | 'green' | 'blue' }>`
  flex: 1;
  height: 44px;
  border: 1px solid var(--cp-line);
  clip-path: var(--cp-clip);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, transform 0.12s, box-shadow 0.15s;
  color: var(--cp-text);
  background: var(--cp-panel);

  > svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    color: ${({ accent }) => `var(--color-${accent})`};
  }

  &:hover {
    transform: translateY(-1px);
    border-color: ${({ accent }) => `var(--color-${accent})`};
    box-shadow: inset 0 0 20px rgba(0, 246, 210, 0.06), 0 0 16px -4px ${({ accent }) => `var(--color-${accent})`};
  }

  &:active {
    transform: none;
  }
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.015);
  border: 1px solid var(--cp-line);
  clip-path: var(--cp-clip);
  padding: 16px;
  overflow: hidden;
`;

const TabsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  border-bottom: 1px solid var(--cp-line);
`;

const TabList = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-end;
`;

const TabButton = styled.button<{ active?: boolean }>`
  border: none;
  cursor: pointer;
  padding: 8px 2px;
  background: transparent;
  font-family: var(--font-mono);
  color: ${({ active }) => (active ? 'var(--cp-text)' : 'var(--cp-muted)')};
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-size: 11px;
  transition: color 120ms ease;
  border-bottom: 2px solid ${({ active }) => (active ? 'var(--cp-accent)' : 'transparent')};
  margin-bottom: -1px;
  text-shadow: ${({ active }) => (active ? '0 0 10px rgba(0,246,210,0.4)' : 'none')};

  &:hover {
    color: var(--cp-text);
  }
`;

const TabCount = styled.span`
  margin-left: 6px;
  color: var(--cp-accent-2);
  font-weight: 600;
`;

const ShowAllBtn = styled.button`
  border: none;
  background: transparent;
  color: var(--cp-accent);
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  padding: 4px 0;

  &:hover {
    text-shadow: 0 0 10px rgba(0, 246, 210, 0.5);
  }
`;

const txListClass = css`
  margin: 0 !important;
`;

const txItemClass = css`
  background-color: rgba(255, 255, 255, 0.015) !important;
  clip-path: var(--cp-clip-sm);
  padding: 12px !important;
  margin: 0 !important;
  border: 1px solid var(--cp-hair) !important;
  cursor: pointer;
  transition: background-color 120ms ease, border-color 120ms ease, transform 120ms ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.04) !important;
    border-color: rgba(255, 255, 255, 0.12) !important;
    transform: translateY(-1px);
  }
`;

type DetailTab = 'balance' | 'transactions';

const AssetDetail = () => {
  const [activeTab, setActiveTab] = useState<DetailTab>('balance');
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const params = useParams();
  const assets = useSelector(selectAssets());
  const transactions = useSelector(selectTransactions());
  const isBalanceHidden = useSelector(selectIsBalanceHidden());

  const currentAsset = useMemo(() => assets.find((a) => a.asset_id?.toString() === params?.id), [params?.id, assets]);

  const filtered = transactions.filter((tx) => tx.asset_id?.toString() === params?.id);
  const txs = showAll ? filtered : filtered.slice(0, 4);

  const navigateToAssets = useCallback(() => {
    navigate(ROUTES.ASSETS.BASE);
  }, [navigate]);

  const handleSend = useCallback(() => {
    if (currentAsset?.asset_id !== undefined) dispatch(setSelectedAssetId(currentAsset.asset_id));
    navigate(ROUTES.WALLET.SEND);
  }, [navigate, dispatch, currentAsset?.asset_id]);

  const handleSwap = useCallback(() => {
    if (currentAsset?.asset_id !== undefined) dispatch(setSelectedAssetId(currentAsset.asset_id));
    navigate(ROUTES.SWAP.BASE);
  }, [navigate, dispatch, currentAsset?.asset_id]);

  const handleReceive = useCallback(() => {
    if (currentAsset?.asset_id !== undefined) dispatch(setSelectedAssetId(currentAsset.asset_id));
    navigate(ROUTES.WALLET.RECEIVE);
  }, [navigate, dispatch, currentAsset?.asset_id]);

  return (
    <Window title={truncate(currentAsset?.metadata_pairs.UN)} showHideButton onPrevious={navigateToAssets}>
      <PageWrap>
        <QuickActions>
          <ActionBtn accent="purple" type="button" onClick={handleSend}>
            <ArrowUpIcon />
            Send
          </ActionBtn>
          <ActionBtn accent="green" type="button" onClick={handleSwap}>
            <ArrowsTowards />
            Swap
          </ActionBtn>
          <ActionBtn accent="blue" type="button" onClick={handleReceive}>
            <ArrowDownIcon />
            Receive
          </ActionBtn>
        </QuickActions>

        <Card>
          <TabsRow>
            <TabList role="tablist">
              <TabButton
                type="button"
                role="tab"
                active={activeTab === 'balance'}
                onClick={() => setActiveTab('balance')}
              >
                Balance
              </TabButton>
              <TabButton
                type="button"
                role="tab"
                active={activeTab === 'transactions'}
                onClick={() => setActiveTab('transactions')}
              >
                Transactions
                <TabCount>{filtered.length}</TabCount>
              </TabButton>
            </TabList>

            {activeTab === 'transactions' && filtered.length > 4 && (
              <ShowAllBtn type="button" onClick={() => setShowAll((v) => !v)}>
                {showAll ? 'Show less' : 'Show all'}
              </ShowAllBtn>
            )}
          </TabsRow>

          <div role="tabpanel">
            {activeTab === 'balance' ? (
              <Assets data={currentAsset ? [currentAsset] : []} isBalanceHidden={isBalanceHidden} />
            ) : (
              <TransactionList
                data={txs}
                isBalanceHidden={isBalanceHidden}
                className={txListClass}
                itemClassName={txItemClass}
              />
            )}
          </div>
        </Card>
      </PageWrap>
    </Window>
  );
};

export default AssetDetail;
