// @ts-nocheck
import React from 'react';
import { Rate } from '@app/shared/components';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';
import {
  fromGroths, compact, toGroths, getTxType, truncate, convertLowAmount,
} from '@core/utils';
import { AddressData } from '@core/types';
import { AssetTotal, TransactionAmount } from '@app/containers/Wallet/interfaces';
import { useSelector } from 'react-redux';
import { selectIsBalanceHidden } from '@app/shared/store/selectors';

// ── Layout ────────────────────────────────────────────────────────────────────

const ConfirmWrap = styled.form`
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 10px;

  :global(html[data-env='fullscreen']) & {
    max-width: 560px;
  }
`;

const SummaryCard = styled.div`
  background: rgba(255, 255, 255, 0.015);
  border: 1px solid var(--cp-line);
  clip-path: var(--cp-clip);
  overflow: hidden;
`;

const Row = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--cp-hair);

  &:last-child {
    border-bottom: none;
  }
`;

const RowLabel = styled.div`
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--cp-muted);
  white-space: nowrap;
  padding-top: 3px;
`;

const RowRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  min-width: 0;
`;

const RowValue = styled.div`
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
  color: var(--cp-text);
  text-align: right;
  word-break: break-all;
`;

const AmountValue = styled.div`
  font-family: var(--font-mono);
  font-size: 20px;
  font-weight: 600;
  color: var(--cp-accent-2);
  text-align: right;
`;

const subRateClass = css`
  margin: 0 !important;
  font-size: 11px !important;
  color: rgba(255, 255, 255, 0.3) !important;
  font-weight: 500 !important;
  text-align: right;
`;

const amountRateClass = css`
  margin: 0 !important;
  font-size: 12px !important;
  color: rgba(255, 255, 255, 0.4) !important;
  font-weight: 500 !important;
`;

// ── Button ────────────────────────────────────────────────────────────────────

const PrimaryBtn = styled.button`
  width: 100%;
  height: 48px;
  border: none;
  clip-path: var(--cp-clip);
  background: linear-gradient(135deg, #8b5cf6 0%, var(--color-purple) 100%);
  color: #fff;
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 0 22px -8px var(--color-purple);
  transition: box-shadow 0.15s, transform 0.12s, filter 0.15s;

  &:hover:not(:disabled) {
    filter: brightness(1.07);
    transform: translateY(-1px);
    box-shadow: 0 0 30px -6px var(--color-purple);
  }

  &:active:not(:disabled) {
    transform: none;
  }
`;

// ─────────────────────────────────────────────────────────────────────────────

interface SendConfirmProps {
  address: string;
  offline: boolean;
  send_amount: TransactionAmount;
  selected: AssetTotal;
  beam: AssetTotal;
  addressData: AddressData;
  fee: number;
  change: number;
  asset_change: number;
  submitSend: () => void;
}

const SendConfirm = (props: SendConfirmProps) => {
  const {
    address, offline, send_amount, selected, addressData, fee, change, submitSend, beam, asset_change,
  } = props;

  const isBalanceHidden = useSelector(selectIsBalanceHidden());

  const { asset_id, amount } = send_amount;
  const value = toGroths(parseFloat(amount));
  const { available, metadata_pairs } = selected;
  const { type: addressType } = addressData;
  const remaining = asset_id === 0 ? available - fee - value : available - value;
  const txType = getTxType(addressType, offline);
  const beamRemaining = beam.available - fee;

  const displayAddress = compact(address);

  return (
    <ConfirmWrap
      onSubmit={(e) => {
        e.preventDefault();
        submitSend();
      }}
    >
      <SummaryCard>
        <Row>
          <RowLabel>Send to</RowLabel>
          <RowRight>
            <RowValue>{displayAddress}</RowValue>
          </RowRight>
        </Row>

        <Row>
          <RowLabel>Type</RowLabel>
          <RowRight>
            <RowValue>{txType}</RowValue>
          </RowRight>
        </Row>

        {!isBalanceHidden && (
          <>
            <Row>
              <RowLabel>Amount</RowLabel>
              <RowRight>
                <AmountValue>
                  {convertLowAmount(Number(amount))}
                  &nbsp;
                  {truncate(metadata_pairs.UN)}
                </AmountValue>
                {selected.asset_id === 0 && <Rate value={value} groths className={amountRateClass} />}
              </RowRight>
            </Row>

            <Row>
              <RowLabel>Fee</RowLabel>
              <RowRight>
                <RowValue>
                  {convertLowAmount(fromGroths(fee))}
                  &nbsp;BEAM
                </RowValue>
                <Rate value={fee} groths className={subRateClass} />
              </RowRight>
            </Row>

            <Row>
              <RowLabel>Change</RowLabel>
              <RowRight>
                <RowValue>
                  {convertLowAmount(fromGroths(selected.asset_id === 0 ? change : asset_change))}
                  &nbsp;
                  {truncate(metadata_pairs.UN)}
                </RowValue>
                <Rate value={selected.asset_id === 0 ? change : asset_change} groths className={subRateClass} />
              </RowRight>
            </Row>

            <Row>
              <RowLabel>Remaining</RowLabel>
              <RowRight>
                <RowValue>
                  {convertLowAmount(fromGroths(remaining))}
                  &nbsp;
                  {truncate(metadata_pairs.UN)}
                </RowValue>
                <Rate value={remaining} groths className={subRateClass} />
              </RowRight>
            </Row>

            {selected.asset_id !== 0 && (
              <Row>
                <RowLabel>BEAM Remaining</RowLabel>
                <RowRight>
                  <RowValue>
                    {convertLowAmount(fromGroths(beamRemaining))}
                    &nbsp;BEAM
                  </RowValue>
                  <Rate value={beamRemaining} groths className={subRateClass} />
                </RowRight>
              </Row>
            )}
          </>
        )}
      </SummaryCard>

      <PrimaryBtn type="submit">Send</PrimaryBtn>
    </ConfirmWrap>
  );
};

export default SendConfirm;
