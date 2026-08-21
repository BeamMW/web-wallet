import React, { useCallback } from 'react';
import { Window } from '@app/shared/components';
import { useSelector } from 'react-redux';
import { selectAssets } from '@app/containers/Wallet/store/selectors';
import { selectIsBalanceHidden } from '@app/shared/store/selectors';
import { ROUTES } from '@app/shared/constants';
import { useNavigate } from 'react-router-dom';
import { styled } from '@linaria/react';
import { ArrowUpIcon, ArrowDownIcon, ArrowsTowards } from '@app/shared/icons';
import { Assets } from '../../../Wallet/components/Wallet';

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

const AssetsList = () => {
  const navigate = useNavigate();
  const isBalanceHidden = useSelector(selectIsBalanceHidden());
  const assets = useSelector(selectAssets());

  const navigateToWallet = useCallback(() => {
    navigate(ROUTES.WALLET.BASE);
  }, [navigate]);

  return (
    <Window title="Assets" showHideButton onPrevious={navigateToWallet}>
      <PageWrap>
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
          <Assets data={assets} isBalanceHidden={isBalanceHidden} />
        </Card>
      </PageWrap>
    </Window>
  );
};

export default AssetsList;
