import React from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';
import { Button, Input } from '@app/shared/components';
import Select, { Option } from '@app/shared/components/Select';
import type { WalletInfoProps } from './WalletInfo';
import { NetworkSelector, NetworkSelectorProps } from './NetworkSelector';
import { MetaMaskIcon } from './MetaMaskIcon';

// ─── Outer shell ─────────────────────────────────────────────────────────────

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  padding: 14px 0 22px;
  max-width: 100%;
  margin: 0 auto;
  width: 100%;

  :global(html[data-env='fullscreen']) & {
    max-width: 560px;
  }
`;

// ─── Connected wallet + network bar ─────────────────────────────────────────

const ConnectedBar = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 12px;
  margin-bottom: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  min-width: 0;
`;

const MMLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
`;

const BarDot = styled.span`
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
`;

const BarAddress = styled.span`
  font-size: 12px;
  font-weight: 600;
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: rgba(255, 255, 255, 0.72);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex-shrink: 1;
`;

const WarnPill = styled.span`
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 8px;
  background: rgba(255, 165, 0, 0.12);
  color: #ffb340;
  white-space: nowrap;
  flex-shrink: 0;
`;

const BarFill = styled.span`
  flex: 1;
`;

// Inline network pills (no outer track — lives inside ConnectedBar)
const BarPillRow = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
`;

const BarPill = styled.button<{ active?: boolean; warn?: boolean }>`
  height: 24px;
  padding: 0 9px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid
    ${({ active, warn }) => {
    if (active && warn) return 'rgba(255,165,0,0.4)';
    if (active) return 'rgba(218,104,245,0.4)';
    return 'rgba(255,255,255,0.08)';
  }};
  background: ${({ active, warn }) => {
    if (active && warn) return 'rgba(255,165,0,0.1)';
    if (active) return 'rgba(218,104,245,0.14)';
    return 'transparent';
  }};
  color: ${({ active, warn }) => {
    if (active && warn) return '#ffb340';
    if (active) return '#da68f5';
    return 'rgba(255,255,255,0.38)';
  }};
  transition: background 0.12s, color 0.12s, border-color 0.12s;

  &:hover:not(:disabled) {
    background: rgba(218, 104, 245, 0.08);
    color: rgba(255, 255, 255, 0.7);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const BarSep = styled.span`
  width: 1px;
  height: 12px;
  background: rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
`;

const BarBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 6px;
  border-radius: 5px;
  flex-shrink: 0;
  transition: background 0.12s, color 0.12s;
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const ChangeBtn = styled(BarBtn)`
  color: rgba(218, 104, 245, 0.8);
  &:hover:not(:disabled) {
    background: rgba(218, 104, 245, 0.1);
    color: #da68f5;
  }
`;

const DisconnectBtn = styled(BarBtn)`
  color: rgba(255, 255, 255, 0.25);
  font-size: 13px;
  padding: 3px 4px;
  &:hover:not(:disabled) {
    background: rgba(255, 69, 58, 0.1);
    color: #ff453a;
  }
`;

function truncate(addr: string): string {
  return addr.length > 14 ? `${addr.slice(0, 7)}…${addr.slice(-5)}` : addr;
}

// ─── Swap stack (FROM + divider + TO in one box) ─────────────────────────────

const SwapStack = styled.div`
  border: 1px solid var(--cp-line);
  clip-path: var(--cp-clip);
  overflow: hidden;
`;

const FromSection = styled.div`
  padding: 14px 16px;
  background: rgba(218, 104, 245, 0.045);
`;

const ToSection = styled.div`
  padding: 14px 16px;
  background: rgba(0, 173, 255, 0.04);
`;

const CardTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const CardRole = styled.span`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.32);
`;

const ChainLabel = styled.span<{ accent: 'purple' | 'blue' }>`
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 20px;
  background: ${({ accent }) => (accent === 'purple' ? 'rgba(218,104,245,0.12)' : 'rgba(0,173,255,0.12)')};
  color: ${({ accent }) => (accent === 'purple' ? '#da68f5' : '#00adff')};
`;

// Divider band with inline swap button — lives inside SwapStack so overflow:hidden is safe
const DividerBand = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 38px;
  background: rgba(0, 0, 0, 0.1);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

const DividerBtn = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.22s;

  &:hover {
    background: rgba(218, 104, 245, 0.14);
    border-color: rgba(218, 104, 245, 0.5);
    color: #da68f5;
    transform: rotate(180deg);
  }
`;

// ─── Amount row ──────────────────────────────────────────────────────────────

const AmountRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

// Same visual height and font as the FROM input element
const OutputAmount = styled.div`
  flex: 1;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: rgba(255, 255, 255, 0.88);
  height: 44px;
  display: flex;
  align-items: center;
  min-width: 0;
`;

const OutputAmountEmpty = styled(OutputAmount)`
  color: rgba(255, 255, 255, 0.18);
`;

const TokenPill = styled.div`
  height: 38px;
  min-width: 80px;
  padding: 0 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.09);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
  flex-shrink: 0;
`;

// ─── Balance line ────────────────────────────────────────────────────────────

const BalanceLine = styled.div`
  display: flex;
  align-items: center;
  margin-top: 8px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.32);
`;

const BalanceLabel = styled.span`
  flex-shrink: 0;
  margin-right: 4px;
`;

const BalanceAmt = styled.span`
  color: rgba(255, 255, 255, 0.62);
  font-weight: 600;
`;

const BalanceSpacer = styled.span`
  flex: 1;
`;

// ─── Fee bar ─────────────────────────────────────────────────────────────────

const FeeSep = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: 12px 0 9px;
`;

const FeeRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  padding: 0 2px;
`;

const FeeItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
`;

const FeeValue = styled.span`
  font-weight: 700;
  color: rgba(255, 255, 255, 0.62);
`;

const FeeTotalSep = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.07);
  margin: 8px 0 7px;
`;

const FeeTotalRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px;
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.45);
`;

const FeeTotalValue = styled.span`
  font-weight: 700;
  color: rgba(255, 255, 255, 0.88);
`;

// ─── Notices ─────────────────────────────────────────────────────────────────

const NoticeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 10px;
`;

const Notice = styled.div<{ tone?: 'error' | 'muted' }>`
  font-size: 11px;
  line-height: 1.45;
  padding: 6px 10px;
  border-radius: 7px;
  border-left: 2px solid ${({ tone }) => (tone === 'error' ? 'rgba(255,69,58,0.7)' : 'rgba(255,255,255,0.15)')};
  background: ${({ tone }) => (tone === 'error' ? 'rgba(255,69,58,0.07)' : 'rgba(255,255,255,0.03)')};
  color: ${({ tone }) => (tone === 'error' ? 'rgba(255,100,90,0.95)' : 'rgba(255,255,255,0.45)')};
`;

// ─── Actions ─────────────────────────────────────────────────────────────────

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-top: 14px;
`;

const PrimaryBtn = styled.button<{ pallete: 'purple' | 'blue' }>`
  width: 100%;
  height: 46px;
  border: none;
  clip-path: var(--cp-clip);
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  cursor: pointer;
  transition: box-shadow 0.15s, transform 0.12s, filter 0.15s;
  color: ${({ pallete }) => (pallete === 'purple' ? '#fff' : '#04121a')};
  background: ${({ pallete }) => (pallete === 'purple'
    ? 'linear-gradient(135deg, #8b5cf6 0%, #da68f5 100%)'
    : 'linear-gradient(135deg, #0bccf7 0%, #00f6d2 100%)')};
  box-shadow: ${({ pallete }) => (pallete === 'purple' ? '0 0 22px -8px #da68f5' : '0 0 22px -8px #00f6d2')};

  &:hover:not(:disabled) {
    filter: brightness(1.07);
    transform: translateY(-1px);
  }
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

// ─── CSS class overrides ─────────────────────────────────────────────────────

// Strip Input component's own border/background so it matches the TO plain-text display
const amountInputClass = css`
  flex: 1;
  min-width: 0;
  margin-bottom: 0 !important;

  /* target wrapper divs the Input component may render */
  > * {
    border: none !important;
    background: transparent !important;
    box-shadow: none !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  input {
    font-family: 'SFProDisplay', sans-serif !important;
    font-size: 24px !important;
    font-weight: 700 !important;
    font-style: normal !important;
    letter-spacing: -0.5px !important;
    padding: 0 !important;
    margin: 0 !important;
    height: 44px !important;
    line-height: 44px !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    color: rgba(255, 255, 255, 0.88) !important;
    width: 100% !important;
  }

  input::placeholder {
    font-family: 'SFProDisplay', sans-serif !important;
    font-size: 24px !important;
    font-weight: 700 !important;
    font-style: normal !important;
    letter-spacing: -0.5px !important;
    color: rgba(255, 255, 255, 0.18) !important;
  }
`;

const tokenSelectClass = css`
  margin-left: 0 !important;
  flex-shrink: 0;

  > button {
    border: 1px solid rgba(255, 255, 255, 0.09) !important;
    border-radius: 10px !important;
    height: 38px !important;
    padding: 0 12px !important;
    background: rgba(255, 255, 255, 0.07) !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 5px !important;
    font-size: 13px !important;
    font-weight: 700 !important;
    min-width: 80px !important;
    justify-content: center !important;
  }
`;

const maxBtnClass = css`
  width: auto !important;
  max-width: none !important;
  margin: 0 !important;
  padding: 2px 6px !important;
  font-size: 10px !important;
  font-weight: 700 !important;
  letter-spacing: 0.5px !important;
  border-radius: 4px !important;
`;

const secondaryBtnClass = css`
  width: 100% !important;
  height: 40px !important;
  border-radius: 10px !important;
  font-size: 13px !important;
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const invalidChars = ['-', '+', 'e', 'E'];

function formatFee(value: number, decimals: number): string {
  return value.toFixed(Math.min(decimals, 8)).replace(/\.?0+$/, '');
}

const SwapIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M4 1.5L1.5 4L4 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M1.5 4H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path
      d="M10 7.5L12.5 10L10 12.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M12.5 10H4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// ─── Prop types ──────────────────────────────────────────────────────────────

type SwapNotice = {
  message: string;
  tone?: 'error' | 'muted';
};

export type SwapFormProps = {
  fromChain: string;
  toChain: string;
  fromColor: 'purple' | 'blue';
  toColor: 'purple' | 'blue';
  onToggleDirection: () => void;

  networkSelector: NetworkSelectorProps;
  walletInfo?: WalletInfoProps;

  notices: SwapNotice[];
  evmSubmitError?: string | null;

  amount: {
    value: string;
    error?: string;
    palette: 'purple' | 'blue';
    onChange: (value: string) => void;
    selectValue: number | string;
    selectOptions: Array<{ value: number | string; label: string }>;
    onSelect: (value: number | string) => void;
    availableLabel: string;
    onMax: () => void;
    isMaxDisabled: boolean;
    isLoadingBalances: boolean;
  };

  output: {
    value: string;
    tokenLabel: string;
  };

  fees: {
    isBeamToEvm: boolean;
    relayerFee: number;
    relayerFeeLabel: string;
    relayerFeeDecimals: number;
    transactionFee?: number;
    feeFallback: boolean;
    totalDeducted?: string | null;
  };

  actions: {
    showConnect: boolean;
    connectLabel: string;
    onConnect: () => void;
    showSwitch: boolean;
    switchLabel: string;
    onSwitch: () => void;
    isLoadingEth: boolean;
    submitLabel: string;
    canSubmit: boolean;
    isSubmitting: boolean;
    submitPalette: 'purple' | 'blue';
  };

  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

// ─── Component ───────────────────────────────────────────────────────────────

export const SwapForm = ({
  fromChain,
  toChain,
  fromColor,
  toColor,
  onToggleDirection,
  networkSelector,
  walletInfo,
  notices,
  evmSubmitError,
  amount,
  output,
  fees,
  actions,
  onSubmit,
}: SwapFormProps) => (
  <Wrap>
    {/* ── Wallet + network header ── */}
    {walletInfo ? (
      <ConnectedBar>
        <MetaMaskIcon size={20} />
        <MMLabel>MetaMask</MMLabel>
        <BarDot />
        <BarAddress title={walletInfo.address}>{truncate(walletInfo.address)}</BarAddress>
        {walletInfo.networkMismatch && <WarnPill>Wrong network</WarnPill>}
        <BarFill />
        <BarPillRow>
          {networkSelector.networks.map((net) => {
            const isActive = net.id === networkSelector.selected;
            const warn = isActive
              && networkSelector.connectedChainId != null
              && String(networkSelector.connectedChainId) !== networkSelector.selected;
            return (
              <BarPill
                key={net.id}
                type="button"
                active={isActive}
                warn={warn}
                disabled={networkSelector.disabled}
                onClick={() => networkSelector.onSelect(net.id)}
              >
                {net.label}
              </BarPill>
            );
          })}
        </BarPillRow>
        <BarSep />
        <ChangeBtn
          type="button"
          onClick={walletInfo.onChangeAccount}
          disabled={walletInfo.isLoading}
          title="Switch MetaMask account"
        >
          Change
        </ChangeBtn>
        <DisconnectBtn
          type="button"
          onClick={walletInfo.onDisconnect}
          disabled={walletInfo.isLoading}
          title="Disconnect wallet"
        >
          ✕
        </DisconnectBtn>
      </ConnectedBar>
    ) : (
      <NetworkSelector {...networkSelector} />
    )}

    <form onSubmit={onSubmit}>
      {/* ── FROM + arrow + TO as a single visual unit ── */}
      <SwapStack>
        <FromSection>
          <CardTop>
            <CardRole>From</CardRole>
            <ChainLabel accent={fromColor}>{fromChain}</ChainLabel>
          </CardTop>

          <AmountRow>
            <Input
              className={amountInputClass}
              variant="amount"
              pallete={amount.palette}
              margin="none"
              inputMode="decimal"
              placeholder="0.0"
              value={amount.value}
              onChange={(e) => amount.onChange(e.target.value)}
              label={amount.error}
              valid={!amount.error}
              onKeyDown={(e) => {
                if (invalidChars.includes(e.key)) e.preventDefault();
              }}
            />
            <Select value={amount.selectValue} className={tokenSelectClass} onSelect={amount.onSelect}>
              {amount.selectOptions.map((opt) => (
                <Option key={String(opt.value)} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </AmountRow>

          <BalanceLine>
            <BalanceLabel>Balance:</BalanceLabel>
            <BalanceAmt>{amount.isLoadingBalances ? '…' : amount.availableLabel}</BalanceAmt>
            <BalanceSpacer />
            <Button
              className={maxBtnClass}
              variant="link"
              pallete="green"
              onClick={amount.onMax}
              disabled={amount.isMaxDisabled}
            >
              MAX
            </Button>
          </BalanceLine>
        </FromSection>

        <DividerBand>
          <DividerBtn type="button" onClick={onToggleDirection} title="Switch direction">
            <SwapIcon />
          </DividerBtn>
        </DividerBand>

        <ToSection>
          <CardTop>
            <CardRole>To</CardRole>
            <ChainLabel accent={toColor}>{toChain}</ChainLabel>
          </CardTop>

          <AmountRow>
            {output.value ? <OutputAmount>{output.value}</OutputAmount> : <OutputAmountEmpty>0.0</OutputAmountEmpty>}
            <TokenPill>{output.tokenLabel}</TokenPill>
          </AmountRow>
        </ToSection>
      </SwapStack>

      {/* ── Fees ── */}
      <FeeSep />
      <FeeRow>
        <FeeItem>
          Relayer fee
          <FeeValue>
            {fees.feeFallback ? '~' : ''}
            {formatFee(fees.relayerFee, fees.relayerFeeDecimals)}
            {' '}
            {fees.relayerFeeLabel}
          </FeeValue>
        </FeeItem>
        {fees.isBeamToEvm && fees.transactionFee != null && (
          <FeeItem>
            Tx fee
            <FeeValue>
              {fees.transactionFee}
              {' '}
              BEAM
            </FeeValue>
          </FeeItem>
        )}
      </FeeRow>
      {fees.totalDeducted && (
        <>
          <FeeTotalSep />
          <FeeTotalRow>
            Total deducted
            <FeeTotalValue>{fees.totalDeducted}</FeeTotalValue>
          </FeeTotalRow>
        </>
      )}

      {/* ── Notices ── */}
      {(notices.length > 0 || evmSubmitError) && (
        <NoticeList>
          {notices.map((n) => (
            <Notice key={n.message} tone={n.tone}>
              {n.message}
            </Notice>
          ))}
          {evmSubmitError && <Notice tone="error">{evmSubmitError}</Notice>}
        </NoticeList>
      )}

      {/* ── Actions ── */}
      <Actions>
        {actions.showConnect && (
          <Button
            className={secondaryBtnClass}
            pallete="green"
            onClick={actions.onConnect}
            disabled={actions.isLoadingEth}
          >
            {actions.connectLabel}
          </Button>
        )}
        {actions.showSwitch && (
          <Button
            className={secondaryBtnClass}
            pallete="purple"
            onClick={actions.onSwitch}
            disabled={actions.isLoadingEth}
          >
            {actions.switchLabel}
          </Button>
        )}
        <PrimaryBtn type="submit" pallete={actions.submitPalette} disabled={!actions.canSubmit || actions.isSubmitting}>
          {actions.submitLabel}
        </PrimaryBtn>
      </Actions>
    </form>
  </Wrap>
);
