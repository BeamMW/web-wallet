// @ts-nocheck
import React, { useCallback, useEffect, useState } from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';

import { Window, Loader, Rate } from '@app/shared/components';
import { ArrowUpIcon, ArrowDownIcon, ArrowsTowards } from '@app/shared/icons';

import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@app/shared/constants';
import { useDispatch, useSelector } from 'react-redux';
import { selectAssets, selectRate } from '@app/containers/Wallet/store/selectors';

import { loadRate, getAssetList } from '@app/containers/Wallet/store/actions';
import { TransactionList } from '@app/containers/Transactions';
import { createdComparator, fromGroths, convertLowAmount } from '@core/utils';
import { selectTransactions } from '@app/containers/Transactions/store/selectors';
import { selectIsBalanceHidden, selectAssetSync, selectIsLoading } from '@app/shared/store/selectors';
import { Assets } from '../../components/Wallet';

const TXS_MAX = 4;

type WalletTab = 'assets' | 'transactions';

const PageWrap = styled.div`
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;

  :global(html[data-env='fullscreen']) & {
    max-width: 560px;
    gap: 18px;
  }
`;

// ── shielded balance hero ─────────────────────────────────────────────────────
const Hero = styled.div`
  position: relative;
  padding: 18px 18px 20px;
  border: 1px solid var(--cp-line);
  clip-path: var(--cp-clip);
  background: radial-gradient(120% 140% at 0% 0%, rgba(0, 246, 210, 0.1), transparent 55%),
    radial-gradient(120% 140% at 100% 100%, rgba(218, 104, 245, 0.1), transparent 55%), var(--cp-panel);
`;

const HeroLabel = styled.div`
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--cp-muted);

  > span {
    color: var(--cp-accent-2);
  }
`;

const HeroRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: 10px;
`;

const HeroNum = styled.div<{ redacted?: boolean }>`
  font-family: var(--font-mono);
  font-size: 30px;
  font-weight: 600;
  letter-spacing: ${({ redacted }) => (redacted ? '2px' : '-0.02em')};
  color: ${({ redacted }) => (redacted ? 'var(--cp-accent-2)' : 'var(--cp-text)')};
  text-shadow: ${({ redacted }) => (redacted ? '0 0 12px rgba(218,104,245,0.5)' : '0 0 24px rgba(0,246,210,0.28)')};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const HeroUnit = styled.div`
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.1em;
  color: var(--cp-accent);
`;

const HeroSub = styled.div`
  margin-top: 8px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--cp-muted);
  display: flex;
  align-items: center;
  gap: 6px;
`;

const heroRateClass = css`
  margin: 0 !important;
  color: var(--cp-accent-3) !important;
  font-family: var(--font-mono) !important;
`;

// ── quick actions ─────────────────────────────────────────────────────────────
const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 9px;
`;

const ActionBtn = styled.button<{ accent: 'purple' | 'green' | 'blue' }>`
  border: 1px solid var(--cp-line);
  background: var(--cp-panel);
  color: var(--cp-text);
  cursor: pointer;
  padding: 12px 6px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  clip-path: var(--cp-clip);
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.12s, background 0.15s;

  > svg {
    width: 20px;
    height: 20px;
    color: ${({ accent }) => `var(--color-${accent})`};
  }

  &:hover {
    transform: translateY(-1px);
    border-color: ${({ accent }) => `var(--color-${accent})`};
    box-shadow: inset 0 0 20px rgba(0, 246, 210, 0.06), 0 0 16px -4px ${({ accent }) => `var(--color-${accent})`};
  }
`;

// ── card + tabs ───────────────────────────────────────────────────────────────
const Card = styled.div`
  border: 1px solid var(--cp-line);
  background: rgba(255, 255, 255, 0.015);
  clip-path: var(--cp-clip);
  padding: 14px;
  overflow: hidden;

  :global(html[data-env='fullscreen']) & {
    padding: 18px;
  }
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

const TabRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
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
    background-color: rgba(0, 246, 210, 0.03) !important;
    border-color: var(--cp-line) !important;
    transform: translateY(-1px);
  }
`;

const Wallet = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const assets = useSelector(selectAssets());
  const transactions = useSelector(selectTransactions());
  const isBalanceHidden = useSelector(selectIsBalanceHidden());
  const isAssetSynced = useSelector(selectAssetSync());
  const isLoading = useSelector(selectIsLoading());
  const rate = useSelector(selectRate());
  const [activeTab, setActiveTab] = useState<WalletTab>('assets');

  useEffect(() => {
    if (!isAssetSynced) {
      setTimeout(() => {
        dispatch(getAssetList.request({ refresh: true }));
      }, 10000);
    }
  }, [dispatch, isAssetSynced]);

  useEffect(() => {
    if (!rate) {
      dispatch(loadRate.request());
    }
  }, [dispatch, rate]);

  const sorted = transactions.slice().sort(createdComparator);
  const txs = sorted.slice(0, TXS_MAX);
  const assts = assets.slice(0, TXS_MAX);

  // BEAM is asset_id 0 — the primary shielded balance.
  const beam = assets.find((a) => a.asset_id === 0);
  const beamAmount = beam ? fromGroths(beam.available) : 0;
  const beamLabel = convertLowAmount(beamAmount);

  const navigateToTransactions = useCallback(() => {
    navigate(ROUTES.TRANSACTIONS.BASE);
  }, [navigate]);

  const navigateToAssets = useCallback(() => {
    navigate(ROUTES.ASSETS.BASE);
  }, [navigate]);

  const navigateToActiveTab = useCallback(() => {
    if (activeTab === 'assets') navigateToAssets();
    else navigateToTransactions();
  }, [activeTab, navigateToAssets, navigateToTransactions]);

  const hasMore = activeTab === 'assets' ? assets.length > TXS_MAX : sorted.length > TXS_MAX;

  return (
    <Window title="Wallet" primary showHideButton>
      <PageWrap>
        <Hero>
          <HeroLabel>Total balance</HeroLabel>
          <HeroRow>
            <HeroNum redacted={isBalanceHidden}>{isBalanceHidden ? '▓▓▓▓▓▓' : beamLabel}</HeroNum>
            <HeroUnit>BEAM</HeroUnit>
          </HeroRow>
          <HeroSub>
            {isBalanceHidden ? (
              ''
            ) : (
              <>
                ≈
                <Rate value={beamAmount} className={heroRateClass} />
              </>
            )}
          </HeroSub>
        </Hero>

        <QuickActions>
          <ActionBtn accent="purple" type="button" onClick={() => navigate(ROUTES.WALLET.SEND)}>
            <ArrowUpIcon />
            Send
          </ActionBtn>
          <ActionBtn accent="green" type="button" onClick={() => navigate(ROUTES.SWAP.BASE)}>
            <ArrowsTowards />
            Swap
          </ActionBtn>
          <ActionBtn accent="blue" type="button" onClick={() => navigate(ROUTES.WALLET.RECEIVE)}>
            <ArrowDownIcon />
            Receive
          </ActionBtn>
        </QuickActions>

        <Card>
          <TabsRow>
            <TabList role="tablist" aria-label="Wallet sections">
              <TabButton
                type="button"
                role="tab"
                aria-selected={activeTab === 'assets'}
                active={activeTab === 'assets'}
                onClick={() => setActiveTab('assets')}
              >
                Assets
                <TabCount>{assets.length}</TabCount>
              </TabButton>
              <TabButton
                type="button"
                role="tab"
                aria-selected={activeTab === 'transactions'}
                active={activeTab === 'transactions'}
                onClick={() => setActiveTab('transactions')}
              >
                Activity
                <TabCount>{sorted.length}</TabCount>
              </TabButton>
            </TabList>

            <TabRight>
              {isLoading && <Loader />}
              {hasMore && (
                <ShowAllBtn type="button" onClick={navigateToActiveTab}>
                  Show all
                </ShowAllBtn>
              )}
            </TabRight>
          </TabsRow>

          <div role="tabpanel">
            {activeTab === 'assets' ? (
              <Assets data={assts} isBalanceHidden={isBalanceHidden} />
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

export default Wallet;
