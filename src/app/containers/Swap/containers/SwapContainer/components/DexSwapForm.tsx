import React from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';
import { Button, Input } from '@app/shared/components';
import Select, { Option } from '@app/shared/components/Select';
import { KIND_LABELS, SLIPPAGE_OPTIONS } from '../../../utils/dexConstants';
import type { DexPool } from '../../../utils/dexApi';

// ─── Layout shell ────────────────────────────────────────────────────────────

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 0 22px;
  max-width: 100%;
  margin: 0 auto;
  width: 100%;

  :global(html[data-env='fullscreen']) & {
    max-width: 560px;
  }
`;

// ─── Swap stack ──────────────────────────────────────────────────────────────

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
  background: rgba(218, 104, 245, 0.02);
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

const ChainLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 20px;
  background: rgba(218, 104, 245, 0.12);
  color: #da68f5;
`;

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

// ─── Fee tier picker ─────────────────────────────────────────────────────────

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

const KindRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
`;

const KindLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.32);
  margin-right: 4px;
  text-transform: uppercase;
`;

const KindPill = styled.button<{ active: boolean; available: boolean }>`
  height: 28px;
  padding: 0 10px;
  border-radius: 7px;
  font-size: 11px;
  font-weight: 700;
  cursor: ${({ available }) => (available ? 'pointer' : 'not-allowed')};
  transition: background 0.12s, color 0.12s, border-color 0.12s;
  border: 1px solid
    ${({ active, available }) => {
    if (!available) return 'rgba(255,255,255,0.05)';
    if (active) return 'rgba(218,104,245,0.4)';
    return 'rgba(255,255,255,0.1)';
  }};
  background: ${({ active, available }) => {
    if (!available) return 'transparent';
    if (active) return 'rgba(218,104,245,0.14)';
    return 'transparent';
  }};
  color: ${({ active, available }) => {
    if (!available) return 'rgba(255,255,255,0.15)';
    if (active) return '#da68f5';
    return 'rgba(255,255,255,0.5)';
  }};

  &:hover:not(:disabled) {
    background: rgba(218, 104, 245, 0.08);
    color: rgba(255, 255, 255, 0.7);
  }
`;

const NoPoolNote = styled.span`
  font-size: 11px;
  color: rgba(255, 165, 0, 0.8);
`;

// ─── Total row ───────────────────────────────────────────────────────────────

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

const Notice = styled.div`
  font-size: 11px;
  line-height: 1.45;
  padding: 6px 10px;
  border-radius: 7px;
  border-left: 2px solid rgba(255, 69, 58, 0.7);
  background: rgba(255, 69, 58, 0.07);
  color: rgba(255, 100, 90, 0.95);
`;

// ─── Action button ───────────────────────────────────────────────────────────

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-top: 14px;
`;

const SwapBtn = styled.button`
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
  transition: filter 0.15s, transform 0.12s;
  color: #fff;
  background: linear-gradient(135deg, #8b5cf6 0%, #da68f5 100%);
  box-shadow: 0 0 22px -8px #da68f5;

  &:hover:not(:disabled) {
    filter: brightness(1.07);
    transform: translateY(-1px);
  }
  &:active:not(:disabled) {
    transform: translateY(0);
    opacity: 1;
  }
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingHint = styled.div`
  font-size: 12px;
  text-align: center;
  color: rgba(255, 255, 255, 0.35);
  padding: 20px 0 8px;
`;

// ─── CSS overrides ───────────────────────────────────────────────────────────

const amountInputClass = css`
  flex: 1;
  min-width: 0;
  margin-bottom: 0 !important;

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

// ─── Icon ────────────────────────────────────────────────────────────────────

const invalidChars = ['-', '+', 'e', 'E'];

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

// ─── Props ───────────────────────────────────────────────────────────────────

export type DexAssetField = {
  aid: number;
  name: string;
  options: Array<{ value: number; label: string }>;
};

export interface DexSwapFormProps {
  isLoadingPools: boolean;

  fromAsset: DexAssetField;
  toAsset: DexAssetField;

  fromAmount: string;
  fromAmountError?: string;
  fromBalanceDisplay: string;
  isMaxDisabled: boolean;

  predictedOutput: string | null;
  isPredicting: boolean;

  minReceiveDisplay: string | null;
  slippagePercent: number;
  onSlippageChange: (percent: number) => void;

  availableKinds: number[];
  selectedKind: number;
  selectedPool: DexPool | null;
  txFee: number;

  onFromAssetChange: (aid: number) => void;
  onToAssetChange: (aid: number) => void;
  onAmountChange: (value: string) => void;
  onMax: () => void;
  onDirectionToggle: () => void;
  onKindChange: (kind: number) => void;
  onSubmit: (event: React.FormEvent) => void;

  canSwap: boolean;
  isSubmitting: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const DexSwapForm = ({
  isLoadingPools,
  fromAsset,
  toAsset,
  fromAmount,
  fromAmountError,
  fromBalanceDisplay,
  isMaxDisabled,
  predictedOutput,
  isPredicting,
  minReceiveDisplay,
  slippagePercent,
  onSlippageChange,
  availableKinds,
  selectedKind,
  selectedPool,
  txFee,
  onFromAssetChange,
  onToAssetChange,
  onAmountChange,
  onMax,
  onDirectionToggle,
  onKindChange,
  onSubmit,
  canSwap,
  isSubmitting,
}: DexSwapFormProps) => {
  const assetsSelected = fromAsset.aid >= 0 && toAsset.aid >= 0;
  const noPoolForKind = assetsSelected && availableKinds.length > 0 && !selectedPool;

  if (isLoadingPools) {
    return <LoadingHint>Loading DEX pools…</LoadingHint>;
  }

  return (
    <Wrap>
      <form onSubmit={onSubmit}>
        <SwapStack>
          {/* ── FROM ── */}
          <FromSection>
            <CardTop>
              <CardRole>From</CardRole>
              <ChainLabel>Beam</ChainLabel>
            </CardTop>

            <AmountRow>
              <Input
                className={amountInputClass}
                variant="amount"
                pallete="purple"
                margin="none"
                inputMode="decimal"
                placeholder="0.0"
                value={fromAmount}
                onChange={(e) => onAmountChange(e.target.value)}
                label={fromAmountError}
                valid={!fromAmountError}
                onKeyDown={(e) => {
                  if (invalidChars.includes(e.key)) e.preventDefault();
                }}
              />
              <Select value={fromAsset.aid} className={tokenSelectClass} onSelect={(v) => onFromAssetChange(Number(v))}>
                {fromAsset.options.map((opt) => (
                  <Option key={opt.value} value={opt.value}>
                    {opt.label}
                    {' '}
                    <span style={{ opacity: 0.45, fontSize: '11px' }}>{opt.value}</span>
                  </Option>
                ))}
              </Select>
            </AmountRow>

            <BalanceLine>
              <BalanceLabel>Balance:</BalanceLabel>
              <BalanceAmt>{fromBalanceDisplay}</BalanceAmt>
              <BalanceSpacer />
              <Button className={maxBtnClass} variant="link" pallete="green" onClick={onMax} disabled={isMaxDisabled}>
                MAX
              </Button>
            </BalanceLine>
          </FromSection>

          {/* ── Divider ── */}
          <DividerBand>
            <DividerBtn type="button" onClick={onDirectionToggle} title="Switch direction">
              <SwapIcon />
            </DividerBtn>
          </DividerBand>

          {/* ── TO ── */}
          <ToSection>
            <CardTop>
              <CardRole>To</CardRole>
              <ChainLabel>Beam</ChainLabel>
            </CardTop>

            <AmountRow>
              {(() => {
                if (isPredicting) {
                  return <OutputAmountEmpty>…</OutputAmountEmpty>;
                }
                if (predictedOutput) {
                  return <OutputAmount>{predictedOutput}</OutputAmount>;
                }
                return <OutputAmountEmpty>0.0</OutputAmountEmpty>;
              })()}
              {toAsset.options.length > 0 ? (
                <Select
                  value={toAsset.aid >= 0 ? toAsset.aid : toAsset.options[0]?.value}
                  className={tokenSelectClass}
                  onSelect={(v) => onToAssetChange(Number(v))}
                >
                  {toAsset.options.map((opt) => (
                    <Option key={opt.value} value={opt.value}>
                      {opt.label}
                      {' '}
                      <span style={{ opacity: 0.45, fontSize: '11px' }}>{opt.value}</span>
                    </Option>
                  ))}
                </Select>
              ) : (
                <TokenPill>{toAsset.name || '—'}</TokenPill>
              )}
            </AmountRow>
          </ToSection>
        </SwapStack>

        {/* ── Fee tier picker (after both assets selected) ── */}
        {assetsSelected && (
          <>
            <FeeSep />
            <KindRow>
              <KindLabel>Fee tier</KindLabel>
              {([0, 1, 2] as const).map((kind) => {
                const available = availableKinds.includes(kind);
                return (
                  <KindPill
                    key={kind}
                    type="button"
                    active={selectedKind === kind}
                    available={available}
                    disabled={!available}
                    onClick={() => available && onKindChange(kind)}
                  >
                    {KIND_LABELS[kind]}
                  </KindPill>
                );
              })}
              {noPoolForKind && <NoPoolNote>No pool for this tier</NoPoolNote>}
            </KindRow>

            <KindRow>
              <KindLabel>Slippage</KindLabel>
              {SLIPPAGE_OPTIONS.map((percent) => (
                <KindPill
                  key={percent}
                  type="button"
                  active={slippagePercent === percent}
                  available
                  onClick={() => onSlippageChange(percent)}
                >
                  {`${percent}%`}
                </KindPill>
              ))}
            </KindRow>

            {/* ── Fee breakdown ── */}
            <FeeRow>
              {selectedPool && (
                <FeeItem>
                  Pool fee
                  <FeeValue>{KIND_LABELS[selectedKind]}</FeeValue>
                </FeeItem>
              )}
              <FeeItem>
                Tx fee
                <FeeValue>
                  {txFee}
                  {' '}
                  BEAM
                </FeeValue>
              </FeeItem>
            </FeeRow>

            {selectedPool && predictedOutput && (
              <>
                <FeeTotalSep />
                <FeeTotalRow>
                  You receive
                  <FeeTotalValue>
                    {predictedOutput}
                    {' '}
                    {toAsset.name}
                  </FeeTotalValue>
                </FeeTotalRow>
                {minReceiveDisplay && (
                  <FeeTotalRow>
                    Minimum received
                    <FeeTotalValue>
                      {minReceiveDisplay}
                      {' '}
                      {toAsset.name}
                    </FeeTotalValue>
                  </FeeTotalRow>
                )}
              </>
            )}
          </>
        )}

        {/* ── Error notices ── */}
        {fromAmountError && (
          <NoticeList>
            <Notice>{fromAmountError}</Notice>
          </NoticeList>
        )}

        {/* ── Action ── */}
        <Actions>
          <SwapBtn type="submit" disabled={!canSwap || isSubmitting}>
            {isSubmitting ? 'Waiting for approval…' : 'Swap'}
          </SwapBtn>
        </Actions>
      </form>
    </Wrap>
  );
};
