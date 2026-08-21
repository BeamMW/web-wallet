// @ts-nocheck
import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';

import { Window, Rate, Toggle } from '@app/shared/components';
import Select, { Option } from '@app/shared/components/Select';
import { CopySmallIcon, IconQrCode, InfoButton } from '@app/shared/icons';

import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@app/shared/constants';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectAddress,
  selectAssets,
  selectReceiveAmount,
  selectSbbs,
  selectSelectedAssetId,
} from '@app/containers/Wallet/store/selectors';
import {
  generateAddress, resetReceive, setReceiveAmount, setSbbs,
} from '@app/containers/Wallet/store/actions';
import { compact, copyToClipboard, truncate } from '@core/utils';
import { toast } from 'react-toastify';
import { AmountError } from '@app/containers/Wallet/constants';
import { TransactionAmount } from '@app/containers/Wallet/interfaces';
import { FullAddress } from '@app/containers';

const REG_AMOUNT = /^(?!0\d)(\d+)(\.)?(\d+)?$/;
const AMOUNT_MAX = 2e14;

// ── Layout ────────────────────────────────────────────────────────────────────

const PageWrap = styled.div`
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

const Card = styled.div`
  background: rgba(255, 255, 255, 0.015);
  border: 1px solid var(--cp-line);
  clip-path: var(--cp-clip);
  padding: 16px;
`;

const FieldLabel = styled.div`
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--cp-muted);
  margin-bottom: 8px;
`;

// ── Address card ──────────────────────────────────────────────────────────────

const AddressRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
`;

const AddressText = styled.div`
  flex: 1;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.5;
  color: var(--cp-text);
  word-break: break-all;
  min-width: 0;
`;

const IconBtnRow = styled.div`
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  align-items: center;
`;

const IconBtn = styled.button`
  border: 1px solid var(--cp-line);
  background: rgba(0, 0, 0, 0.3);
  clip-path: var(--cp-clip-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  line-height: 0;
  color: var(--cp-muted);
  transition: background 0.12s, color 0.12s, border-color 0.12s;

  &:hover {
    border-color: var(--cp-accent);
    color: var(--cp-accent);
    box-shadow: 0 0 12px -3px rgba(0, 246, 210, 0.5);
  }
`;

const AddressHint = styled.div`
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--cp-muted);
  margin-top: 8px;
`;

// ── Amount card ───────────────────────────────────────────────────────────────

const AmountRow = styled.div`
  display: flex;
  align-items: stretch;
  gap: 8px;
`;

const AmountNumInput = styled.input`
  flex: 1;
  min-width: 0;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid var(--cp-line);
  clip-path: var(--cp-clip);
  padding: 10px 14px;
  font-size: 22px;
  font-weight: 600;
  color: var(--cp-text);
  outline: none;
  font-family: var(--font-mono);
  transition: border-color 0.15s, box-shadow 0.15s;
  min-height: 52px;

  &::placeholder {
    color: var(--cp-muted);
    font-weight: 400;
  }

  &.error {
    border-color: var(--cp-danger);
  }

  &:focus {
    border-color: var(--cp-accent);
    box-shadow: 0 0 18px -6px rgba(0, 246, 210, 0.5);
  }

  -moz-appearance: textfield;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const tokenSelectClass = css`
  margin-left: 0 !important;
  flex-shrink: 0;
  display: flex !important;
  flex-direction: column !important;

  > button {
    flex: 1 !important;
    border: 1px solid var(--cp-line) !important;
    clip-path: var(--cp-clip) !important;
    padding: 0 14px !important;
    background: rgba(0, 0, 0, 0.3) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 6px !important;
    font-family: var(--font-mono) !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    min-width: 90px !important;
    color: var(--cp-text) !important;
  }
`;

const rateClass = css`
  margin: 0 !important;
  margin-top: 6px !important;
  font-family: var(--font-mono) !important;
  font-size: 12px !important;
  color: var(--cp-accent-3) !important;
  font-weight: 500 !important;
`;

const ErrorText = styled.div`
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--cp-danger);
  margin-top: 6px;
`;

// ── Collapsible cards ─────────────────────────────────────────────────────────

const CollapseHeader = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  color: inherit;
`;

const Chevron = styled.span`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
`;

const CommentInput = styled.textarea`
  width: 100%;
  margin-top: 10px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid var(--cp-line);
  clip-path: var(--cp-clip);
  padding: 10px 12px;
  color: var(--cp-text);
  font-size: 13px;
  font-family: var(--font-mono);
  resize: none;
  outline: none;
  height: 72px;
  box-sizing: border-box;

  &::placeholder {
    color: var(--cp-muted);
  }

  &:focus {
    border-color: var(--cp-accent);
    box-shadow: 0 0 18px -6px rgba(0, 246, 210, 0.5);
  }
`;

const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  font-size: 13px;
  color: var(--cp-text);
`;

// ── Warning notice ────────────────────────────────────────────────────────────

const Notice = styled.div`
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--cp-muted);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--cp-line);
  clip-path: var(--cp-clip);
  padding: 12px 14px;
  line-height: 1.6;
`;

// ── Primary button ────────────────────────────────────────────────────────────

const PrimaryBtn = styled.button`
  width: 100%;
  height: 48px;
  border: none;
  clip-path: var(--cp-clip);
  background: linear-gradient(120deg, var(--color-blue), var(--cp-accent));
  color: #04121a;
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 0 22px -8px var(--color-blue);
  transition: box-shadow 0.15s, transform 0.12s, filter 0.15s;

  &:hover:not(:disabled) {
    filter: brightness(1.07);
    transform: translateY(-1px);
    box-shadow: 0 0 30px -6px var(--color-blue);
  }

  &:active:not(:disabled) {
    transform: none;
  }

  &:disabled {
    opacity: 0.35;
    cursor: default;
    box-shadow: none;
  }
`;

// ── QR modal ──────────────────────────────────────────────────────────────────

const QrOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const QrPanel = styled.div`
  background: var(--cp-panel);
  border: 1px solid var(--cp-line);
  clip-path: var(--cp-clip);
  padding: 26px 22px;
  width: 300px;
  max-width: calc(100vw - 28px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  box-shadow: 0 24px 60px -18px rgba(0, 0, 0, 0.85), 0 0 40px -18px rgba(0, 246, 210, 0.3);
`;

const QrFrame = styled.div`
  background: white;
  border-radius: 6px;
  padding: 10px;
  display: flex;
  box-shadow: 0 0 24px -6px rgba(0, 246, 210, 0.5);
`;

const QrCaption = styled.div`
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--cp-muted);
  text-align: center;
  line-height: 1.6;
  white-space: pre-line;
`;

const QrCopyBtn = styled(PrimaryBtn)`
  width: 100%;
`;

// ─────────────────────────────────────────────────────────────────────────────

const Receive = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [qrVisible, setQrVisible] = useState(false);
  const [showFullAddress, setShowFullAddress] = useState(false);
  const [maxAnonymity, setMaxAnonymity] = useState(false);
  const [comment, setComment] = useState('');
  const [commentOpen, setCommentOpen] = useState(false);
  const [advOpen, setAdvOpen] = useState(false);
  const [amountError, setAmountError] = useState('');

  const receiveAmount = useSelector(selectReceiveAmount());
  const addressFull = useSelector(selectAddress());
  const sbbs = useSelector(selectSbbs());
  const selected_asset_id = useSelector(selectSelectedAssetId());
  const assets = useSelector(selectAssets());

  const address = compact(addressFull, 32);
  const { amount, asset_id } = receiveAmount;

  useEffect(
    () => () => {
      dispatch(resetReceive());
      dispatch(setSbbs(null));
    },
    [dispatch],
  );

  useEffect(() => {
    if (selected_asset_id && Number(asset_id) !== selected_asset_id) {
      dispatch(setReceiveAmount({ amount, asset_id: selected_asset_id }));
    }
  }, [selected_asset_id, asset_id, amount, dispatch]);

  useEffect(() => {
    if (comment) {
      dispatch(
        generateAddress.request({
          type: maxAnonymity ? 'max_privacy' : 'offline',
          comment,
          use_default_signature: true,
        }),
      );
    } else {
      dispatch(
        generateAddress.request({
          type: maxAnonymity ? 'max_privacy' : 'offline',
          use_default_signature: true,
        }),
      );
    }
  }, [dispatch, maxAnonymity, comment]);

  const copyAddress = async () => {
    toast('Address copied to clipboard');
    await copyToClipboard(addressFull);
  };

  const submitForm = async () => {
    await copyAddress();
    navigate(ROUTES.WALLET.BASE);
  };

  const copyAndCloseQr = async () => {
    await copyAddress();
    setQrVisible(false);
  };

  const saveReceiveAmount = (send_amount: TransactionAmount) => {
    setAmountError('');
    if (
      Number(send_amount.amount) < 0.00000001
      && Number(send_amount.amount) !== 0
      && send_amount.amount !== ''
      && send_amount.asset_id === 0
    ) {
      setAmountError(AmountError.LESS);
    }
    dispatch(setReceiveAmount(send_amount));
  };

  const qrCaption = maxAnonymity
    ? 'Transaction can last at most 72 hours.\nMin transaction fee is 0.01 BEAM.'
    : 'Sender will be given a choice between regular and offline payment.\n\nFor online payment, get online within 12 hours after coins are sent.';

  return showFullAddress ? (
    <FullAddress
      pallete="blue"
      address={addressFull}
      onClose={() => setShowFullAddress(false)}
      isMaxAnonymity={maxAnonymity}
      hint={!maxAnonymity ? 'Regular address includes both online and offline addresses.' : ''}
      sbbs={sbbs}
    />
  ) : (
    <Window title="Receive" pallete="blue">
      {qrVisible && (
        <QrOverlay onClick={() => setQrVisible(false)}>
          <QrPanel onClick={(e) => e.stopPropagation()}>
            <QrFrame>
              <QRCode value={`${addressFull}`} size={220} bgColor="white" />
            </QrFrame>
            <QrCaption>{qrCaption}</QrCaption>
            <QrCopyBtn type="button" onClick={copyAndCloseQr}>
              Copy & Close
            </QrCopyBtn>
          </QrPanel>
        </QrOverlay>
      )}

      <PageWrap>
        <Card>
          <FieldLabel>
            Your address
            {maxAnonymity ? ' (Maximum anonymity)' : ''}
          </FieldLabel>
          <AddressRow>
            <AddressText>{address}</AddressText>
            <IconBtnRow>
              <IconBtn type="button" title="Show QR code" onClick={() => setQrVisible(true)}>
                <IconQrCode />
              </IconBtn>
              <IconBtn type="button" title="Copy address" onClick={copyAddress}>
                <CopySmallIcon />
              </IconBtn>
              <IconBtn type="button" title="Full address details" onClick={() => setShowFullAddress(true)}>
                <InfoButton />
              </IconBtn>
            </IconBtnRow>
          </AddressRow>
          {!maxAnonymity && <AddressHint>New address is generated every time to ensure better privacy.</AddressHint>}
        </Card>

        <Card>
          <FieldLabel>Requested amount (optional)</FieldLabel>
          <AmountRow>
            <AmountNumInput
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              className={amountError ? 'error' : ''}
              onInput={(e) => {
                const raw = e.target.value;
                if (raw !== '' && !REG_AMOUNT.test(raw)) return;
                if (raw !== '' && parseFloat(raw) > AMOUNT_MAX) return;
                saveReceiveAmount({ amount: raw, asset_id });
              }}
            />
            <Select
              value={asset_id}
              className={tokenSelectClass}
              onSelect={(next) => saveReceiveAmount({ amount: '', asset_id: Number(next) })}
            >
              {assets.map(({ asset_id: id, metadata_pairs }) => (
                <Option key={id} value={id}>
                  {truncate(metadata_pairs.UN || metadata_pairs.N || `Asset #${id}`)}
                </Option>
              ))}
            </Select>
          </AmountRow>
          {amountError && <ErrorText>{amountError}</ErrorText>}
          {asset_id === 0 && !amountError && amount && <Rate value={parseFloat(amount)} className={rateClass} />}
        </Card>

        <Card>
          <CollapseHeader type="button" onClick={() => setCommentOpen((v) => !v)}>
            <FieldLabel style={{ margin: 0 }}>Comment</FieldLabel>
            <Chevron>{commentOpen ? '▴' : '▾'}</Chevron>
          </CollapseHeader>
          {commentOpen && (
            <CommentInput
              placeholder="Add a note (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          )}
        </Card>

        <Card>
          <CollapseHeader type="button" onClick={() => setAdvOpen((v) => !v)}>
            <FieldLabel style={{ margin: 0 }}>Advanced</FieldLabel>
            <Chevron>{advOpen ? '▴' : '▾'}</Chevron>
          </CollapseHeader>
          {advOpen && (
            <ToggleRow>
              <span>Maximum anonymity</span>
              <Toggle id="ma" value={maxAnonymity} onChange={() => setMaxAnonymity((v) => !v)} />
            </ToggleRow>
          )}
        </Card>

        {maxAnonymity ? (
          <Notice>
            Transaction can last at most 72 hours.
            <br />
            <br />
            Min transaction fee is 0.01 BEAM.
          </Notice>
        ) : (
          <Notice>
            Sender will be given a choice between regular and offline payment.
            <br />
            <br />
            For online payment to complete, get online within 12 hours after coins are sent.
          </Notice>
        )}

        <PrimaryBtn type="button" onClick={submitForm} disabled={!!amountError}>
          Copy & Close
        </PrimaryBtn>
      </PageWrap>
    </Window>
  );
};

export default Receive;
