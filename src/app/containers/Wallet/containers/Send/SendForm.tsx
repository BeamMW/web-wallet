// @ts-nocheck
import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';

import { Rate, Window } from '@app/shared/components';
import Select, { Option } from '@app/shared/components/Select';
import { IconCancel, InfoButton } from '@app/shared/icons';
import LabeledToggle from '@app/shared/components/LabeledToggle';

import { styled } from '@linaria/react';
import { css } from '@linaria/core';
import {
  compact, convertLowAmount, fromGroths, toGroths, truncate,
} from '@core/utils';
import { useFormik } from 'formik';

import {
  AddressLabel, AddressTip, AmountError, ASSET_BLANK, FEE_DEFAULT,
} from '@app/containers/Wallet/constants';
import { useDispatch, useSelector } from 'react-redux';
import {
  resetSendData,
  sendTransaction,
  setSbbs,
  setSelectedAssetId,
  validateAmount,
  validateSendAddress,
} from '@app/containers/Wallet/store/actions';
import {
  selectAssetChange,
  selectAssets,
  selectChange,
  selectIsSendReady,
  selectSbbs,
  selectSelectedAssetId,
  selectSendAddressData,
  selectSendFee,
} from '@app/containers/Wallet/store/selectors';
import { AssetTotal, TransactionAmount } from '@app/containers/Wallet/interfaces';
import { AddressData } from '@core/types';
import { FullAddress, SendConfirm } from '@app/containers';
import { selectIsBalanceHidden } from '@app/shared/store/selectors';

const REG_AMOUNT = /^(?!0\d)(\d+)(\.)?(\d+)?$/;
const AMOUNT_MAX = 2e14;

// ── Layout ───────────────────────────────────────────────────────────────────

const PageWrap = styled.form`
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
  overflow: hidden;
`;

const FieldLabel = styled.div`
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--cp-muted);
  margin-bottom: 8px;
`;

// ── Address card ─────────────────────────────────────────────────────────────

const AddressInputWrap = styled.div<{ error?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid ${({ error }) => (error ? 'var(--cp-danger)' : 'var(--cp-line-2)')};
  clip-path: var(--cp-clip);
  padding: 8px 10px;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus-within {
    border-color: ${({ error }) => (error ? 'var(--cp-danger)' : 'var(--cp-accent-2)')};
    box-shadow: 0 0 18px -6px rgba(218, 104, 245, 0.5);
  }
`;

const AddressTextInput = styled.input`
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  color: var(--cp-text);
  font-size: 13px;
  font-family: var(--font-mono);
  letter-spacing: 0.02em;

  &::placeholder {
    color: var(--cp-muted);
  }
`;

const SmallBtn = styled.button`
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--cp-muted);
  clip-path: polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px);
  padding: 0;
  transition: color 0.12s, background 0.12s;

  &:hover:not(:disabled) {
    color: var(--cp-accent-2);
    background: rgba(218, 104, 245, 0.12);
  }

  &:disabled {
    opacity: 0.25;
    cursor: default;
  }
`;

const HintText = styled.div<{ error?: boolean }>`
  font-family: var(--font-mono);
  font-size: 11px;
  margin-top: 6px;
  letter-spacing: 0.02em;
  color: ${({ error }) => (error ? 'var(--cp-danger)' : 'var(--cp-muted)')};
`;

// ── Tx type card ─────────────────────────────────────────────────────────────

const TypeRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 24px;
  font-weight: 700;
  color: white;
  outline: none;
  font-family: 'SFProDisplay';
  transition: border-color 0.15s;
  min-height: 52px;

  &::placeholder {
    color: rgba(255, 255, 255, 0.2);
    font-weight: 400;
  }

  &.error {
    border-color: rgba(255, 90, 90, 0.6);
  }

  &:focus {
    border-color: rgba(255, 255, 255, 0.22);
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
    border: 1px solid rgba(255, 255, 255, 0.09) !important;
    border-radius: 10px !important;
    padding: 0 14px !important;
    background: rgba(255, 255, 255, 0.07) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 6px !important;
    font-size: 14px !important;
    font-weight: 700 !important;
    min-width: 90px !important;
    color: white !important;
  }
`;

const BalanceLine = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  flex-wrap: wrap;
`;

const BalanceSpacer = styled.div`
  flex: 1;
`;

const MaxBtn = styled.button`
  border: none;
  background: transparent;
  color: var(--color-green);
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 0.08em;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: background 0.12s;

  &:hover {
    background: rgba(0, 246, 204, 0.1);
  }
`;

const rateInlineClass = css`
  margin: 0 !important;
  font-size: 12px !important;
  color: rgba(255, 255, 255, 0.35) !important;
  font-weight: 500 !important;
`;

const ErrorText = styled.div`
  font-size: 12px;
  color: #ff6b6b;
  margin-top: 6px;
  font-style: italic;
`;

// ── Comment card ──────────────────────────────────────────────────────────────

const CommentHeader = styled.button`
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
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 10px;
  padding: 10px 12px;
  color: white;
  font-size: 13px;
  font-family: 'SFProDisplay';
  resize: none;
  outline: none;
  height: 72px;
  box-sizing: border-box;

  &::placeholder {
    color: rgba(255, 255, 255, 0.25);
  }

  &:focus {
    border-color: rgba(255, 255, 255, 0.22);
  }
`;

// ── Warning notice ────────────────────────────────────────────────────────────

const Notice = styled.div`
  font-size: 12px;
  font-style: italic;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 12px 14px;
`;

// ── Submit button ─────────────────────────────────────────────────────────────

const PrimaryBtn = styled.button`
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 12px;
  background: var(--color-purple);
  color: var(--color-dark-blue);
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.12s;

  &:hover:not(:disabled) {
    opacity: 0.88;
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: none;
    opacity: 1;
  }

  &:disabled {
    opacity: 0.35;
    cursor: default;
  }
`;

// ─────────────────────────────────────────────────────────────────────────────

interface SendFormData {
  address: string;
  offline: boolean;
  send_amount: TransactionAmount;
  comment: string;
  misc: {
    beam: AssetTotal;
    selected: AssetTotal;
    fee: number;
    addressData: AddressData;
  };
}

const validate = async (values: SendFormData, setHint: (string) => void) => {
  const errors: any = {};
  const {
    addressData, selected, beam, fee,
  } = values.misc;

  if (!values.address.length) {
    errors.address = '';
  }

  if ((values.address.length && !addressData.is_valid) || addressData.type === 'unknown') {
    errors.address = AddressLabel.ERROR;
  }

  if (values.offline && addressData.type !== 'max_privacy' && addressData.type !== 'public_offline') {
    const warning = addressData.payments > 1
      ? 'transactions left.'
      : 'transaction left. Ask receiver to come online to support more offline transactions.';

    const label = `${AddressLabel.OFFLINE} ${addressData.payments} ${warning}`;

    setHint(label);
  } else if (addressData.type === 'max_privacy' && values.address.length) {
    setHint(AddressLabel.MAX_PRIVACY);
  } else if (addressData.type === 'public_offline' && values.address.length) {
    setHint(AddressLabel.PUBLIC_OFFLINE);
  } else {
    setHint('');
  }

  if (!values.send_amount.amount.length) {
    errors.send_amount = '';
  }

  const { send_amount } = values;
  const { available } = selected;
  const value = toGroths(parseFloat(send_amount.amount));

  const total = value + (send_amount.asset_id === 0 ? fee : 0);

  if (
    Number(send_amount.amount) < 0.00000001
    && Number(send_amount.amount) !== 0
    && send_amount.amount !== ''
    && send_amount.asset_id === 0
  ) {
    errors.send_amount = AmountError.LESS;
  }

  if (beam.available < fee) {
    errors.send_amount = AmountError.FEE;
  }

  if (total > available) {
    const max = fromGroths(available - (send_amount.asset_id === 0 ? fee : 0));
    errors.send_amount = `${AmountError.AMOUNT} ${max} ${truncate(selected.metadata_pairs.UN)}`;
  }

  return errors;
};

const SendForm = () => {
  const dispatch = useDispatch();
  const [note, changeNote] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [focus, setFocus] = useState(false);
  const [showFullAddress, setShowFullAddress] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [validateInterval, setValidateInterval] = useState<ReturnType<typeof setTimeout> | null>(null);
  const addressData = useSelector(selectSendAddressData());
  const sbbs = useSelector(selectSbbs());

  const [warning, setWarning] = useState('');
  const [hint, setHint] = useState('');
  const [selected, setSelected] = useState(ASSET_BLANK);

  const assets = useSelector(selectAssets());

  const fee = useSelector(selectSendFee());
  const change = useSelector(selectChange());
  const asset_change = useSelector(selectAssetChange());
  const is_send_ready = useSelector(selectIsSendReady());
  const selected_asset_id = useSelector(selectSelectedAssetId());
  const isBalanceHidden = useSelector(selectIsBalanceHidden());

  const beam = useMemo(() => assets.find((a) => a.asset_id === 0), [assets]);

  const formik = useFormik<SendFormData>({
    initialValues: {
      address: '',
      offline: false,
      send_amount: {
        amount: '',
        asset_id: selected_asset_id,
      },
      comment: '',
      misc: {
        addressData,
        fee,
        beam,
        selected,
      },
    },
    isInitialValid: false,
    validate: (e) => validate(e, setHint),
    onSubmit: () => {
      formik.setFieldValue('comment', note, false);
      setShowConfirm(true);
    },
  });

  const {
    values, setFieldValue, errors, submitForm,
  } = formik;

  const { type: addressType } = addressData;

  const compactAddress = useMemo(() => compact(values.address, 15), [values.address]);

  useEffect(() => {
    if (selected_asset_id !== 0 && values.send_amount.asset_id !== selected_asset_id) {
      const current_asset = assets.find((a) => a.asset_id === selected_asset_id);

      setSelected(current_asset);
      setFieldValue('send_amount', { amount: 0, asset_id: selected_asset_id }, true);
      setFieldValue('misc.selected', current_asset, true);
    }
  }, [selected_asset_id, setFieldValue, assets, values, dispatch]);

  useEffect(
    () => () => {
      dispatch(resetSendData());
      dispatch(setSelectedAssetId(0));
      dispatch(setSbbs(null));
    },
    [dispatch],
  );

  useEffect(() => {
    const currentSelected = JSON.stringify(selected);
    const defaultStateSelected = JSON.stringify(ASSET_BLANK);
    if (currentSelected === defaultStateSelected) {
      setSelected(beam);
      setFieldValue('misc.selected', beam, true);
    }
  }, [selected, beam, setFieldValue]);

  const validateAmountHandler = useCallback(
    (total: TransactionAmount, offline: boolean) => {
      const { amount, asset_id } = total;

      if (amount === '0' || !amount) {
        setFieldValue('send_amount', total, true);
        return;
      }

      setFieldValue('send_amount', total, true);

      dispatch(
        validateAmount.request({
          amount: toGroths(+amount),
          asset_id,
          is_push_transaction: offline,
        }),
      );
    },
    [dispatch, setFieldValue, fee],
  );

  useEffect(() => {
    if (!values.address.length) return;

    setFieldValue('misc.addressData', addressData, true);
    if (addressData.amount && addressData.asset_id) {
      setFieldValue('send_amount', { amount: addressData.amount, asset_id: addressData.asset_id }, true);
    }

    switch (addressData.type) {
      case 'max_privacy':
        setWarning(AddressTip.MAX_PRIVACY);
        setHint(AddressLabel.MAX_PRIVACY);
        setFieldValue('offline', true, false);
        validateAmountHandler(values.send_amount, true);
        break;
      case 'public_offline':
        setWarning(AddressTip.OFFLINE);
        setHint(AddressLabel.OFFLINE);
        setFieldValue('offline', true, false);
        validateAmountHandler(values.send_amount, true);
        break;
      case 'regular':
        setWarning(AddressTip.REGULAR);
        setHint(AddressLabel.REGULAR);
        setFieldValue('offline', false, true);
        validateAmountHandler(values.send_amount, false);
        break;
      default:
        validateAmountHandler(values.send_amount, values.offline);
        break;
    }

    if (values.offline) {
      setWarning(AddressTip.OFFLINE);
    } else if (addressData.is_valid) {
      setWarning(AddressTip.REGULAR);
    }
  }, [addressData, fee, setFieldValue, validateAmountHandler, values]);

  const groths = fromGroths(selected.available);

  const validateAddressHandler = (address: string) => {
    if (validateInterval) {
      clearTimeout(validateInterval);
      setValidateInterval(null);
    }
    const i = setTimeout(() => {
      dispatch(validateSendAddress.request(address));
    }, 200);
    setValidateInterval(i);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFieldValue('address', value, true);
    if (value.length) validateAddressHandler(value);
  };

  const handleAssetChange = (e: TransactionAmount) => {
    const isMaxPrivacy = addressData.type === 'max_privacy';
    setFieldValue('send_amount', e, true);
    const asset = assets.find(({ asset_id: id }) => id === e.asset_id) ?? ASSET_BLANK;
    setSelected(asset);
    setFieldValue('misc.selected', asset, true);
    validateAmountHandler(e, values.offline || isMaxPrivacy);
  };

  const handleMaxAmount = (offline?: boolean) => {
    const { available } = selected;
    const { send_amount } = values;
    const isMaxPrivacy = addressData.type === 'max_privacy';
    let currentFee = values.offline || isMaxPrivacy || offline ? 1100000 : fee;

    if (typeof offline !== 'undefined') {
      currentFee = offline ? 1100000 : FEE_DEFAULT;
    }

    const total = send_amount.asset_id === 0 ? Math.max(available - currentFee, 0) : available;
    const new_amount = fromGroths(total).toString();

    const amount = {
      asset_id: send_amount.asset_id,
      amount: new_amount,
    };

    setFieldValue('send_amount', amount, true);
    validateAmountHandler(amount, values.offline || isMaxPrivacy || offline);
  };

  const handleOffline = (e: boolean) => {
    setFieldValue('offline', e, true);
    const { send_amount } = values;
    const { amount, asset_id } = send_amount;
    if (amount === '0') {
      validateAmountHandler(values.send_amount, e);
    } else if (asset_id === 0) {
      const { available } = selected;
      const value = Number(amount);
      const val = available - toGroths(value);
      if (fromGroths(val) < 1) {
        handleMaxAmount(e);
      }
    }
  };

  const getAddressHint = () => {
    if (!values.address.length) return '';
    if (!is_send_ready && values.address.length && errors.address) return '';
    if (errors.address) return errors.address;
    if (hint) return hint;
    if (values.address.length) return AddressLabel.REGULAR;
    return '';
  };

  const submitSend = useCallback(() => {
    const {
      send_amount, address, offline, comment,
    } = values;
    const isMaxPrivacy = addressData.type === 'max_privacy';
    const value = send_amount.amount === '' ? 0 : toGroths(parseFloat(send_amount.amount));

    const transactionPayload = {
      fee,
      value,
      address,
      comment,
      asset_id: send_amount.asset_id,
      offline: offline || isMaxPrivacy,
    };

    dispatch(sendTransaction.request(transactionPayload));
  }, [values, fee, addressData, dispatch]);

  const handlePrevious: React.MouseEventHandler = () => {
    setShowConfirm(false);
  };

  const isFormDisabled = () => {
    if (!is_send_ready) return !is_send_ready;
    if (!formik.isValid) return !formik.isValid;
    return false;
  };

  const getAddressToUse = () => {
    let addressToUse;
    if (focus || !values.address) {
      addressToUse = compactAddress;
    } else {
      addressToUse = values.address;
    }
    return addressToUse;
  };

  const hintText = getAddressHint();
  const addressHasError = !!(is_send_ready && errors.address);

  return showFullAddress ? (
    <FullAddress
      addressData={addressData}
      pallete="purple"
      address={values.address}
      onClose={() => setShowFullAddress(false)}
      hint={hintText}
      isOffline={values.offline}
      sbbs={sbbs}
    />
  ) : (
    <Window title="Send" pallete="purple" showHideButton onPrevious={showConfirm ? handlePrevious : undefined}>
      {!showConfirm ? (
        <PageWrap
          onSubmit={(e) => {
            e.preventDefault();
            submitForm();
          }}
        >
          <Card>
            <FieldLabel>Send to</FieldLabel>
            <AddressInputWrap error={addressHasError}>
              <AddressTextInput
                placeholder="Paste recipient address here"
                value={getAddressToUse()}
                onInput={handleAddressChange}
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
                autoComplete="off"
                spellCheck={false}
              />
              {values.address && (
                <SmallBtn type="button" title="Clear" onClick={() => setFieldValue('address', '')}>
                  <IconCancel />
                </SmallBtn>
              )}
              <SmallBtn
                type="button"
                title="View full address"
                disabled={!values.address || !addressData.is_valid}
                onClick={() => setShowFullAddress(true)}
              >
                <InfoButton />
              </SmallBtn>
            </AddressInputWrap>
            {hintText && <HintText error={addressHasError}>{hintText}</HintText>}
          </Card>

          {values.address && addressType === 'offline' && (
            <Card>
              <TypeRow>
                <FieldLabel style={{ margin: 0 }}>Transaction type</FieldLabel>
                <LabeledToggle left="Online" right="Offline" value={values.offline} onChange={handleOffline} />
              </TypeRow>
            </Card>
          )}

          <Card>
            <FieldLabel>Amount</FieldLabel>
            <AmountRow>
              <AmountNumInput
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={values.send_amount.amount}
                className={errors.send_amount ? 'error' : ''}
                onInput={(e) => {
                  const raw = e.target.value;
                  if (raw !== '' && !REG_AMOUNT.test(raw)) return;
                  if (raw !== '' && parseFloat(raw) > AMOUNT_MAX) return;
                  handleAssetChange({ amount: raw, asset_id: values.send_amount.asset_id });
                }}
              />
              <Select
                value={values.send_amount.asset_id}
                className={tokenSelectClass}
                onSelect={(next) => handleAssetChange({
                  amount: values.send_amount.amount || '',
                  asset_id: Number(next),
                })}
              >
                {assets.map(({ asset_id: id, metadata_pairs }) => (
                  <Option key={id} value={id}>
                    {truncate(metadata_pairs.UN || metadata_pairs.N || `Asset #${id}`)}
                  </Option>
                ))}
              </Select>
            </AmountRow>
            {errors.send_amount && <ErrorText>{errors.send_amount}</ErrorText>}
            {!isBalanceHidden && (
              <BalanceLine>
                <span>
                  Available:&nbsp;
                  {convertLowAmount(groths)}
                  &nbsp;
                  {truncate(selected.metadata_pairs.N)}
                </span>
                {selected.asset_id === 0 && !errors.send_amount && <Rate value={groths} className={rateInlineClass} />}
                <BalanceSpacer />
                {groths > 0 && (
                  <MaxBtn type="button" onClick={() => handleMaxAmount()}>
                    MAX
                  </MaxBtn>
                )}
              </BalanceLine>
            )}
          </Card>

          <Card>
            <CommentHeader type="button" onClick={() => setCommentOpen((v) => !v)}>
              <FieldLabel style={{ margin: 0 }}>Comment</FieldLabel>
              <Chevron>{commentOpen ? '▴' : '▾'}</Chevron>
            </CommentHeader>
            {commentOpen && (
              <CommentInput
                placeholder="Add a note (optional)"
                value={note}
                onChange={(e) => changeNote(e.target.value)}
              />
            )}
          </Card>

          {warning && <Notice>{warning}</Notice>}

          <PrimaryBtn type="submit" disabled={isFormDisabled()}>
            Next →
          </PrimaryBtn>
        </PageWrap>
      ) : (
        <SendConfirm
          beam={beam}
          address={values.address}
          addressData={addressData}
          offline={values.offline}
          send_amount={values.send_amount}
          selected={selected}
          fee={fee}
          change={change}
          asset_change={asset_change}
          submitSend={submitSend}
        />
      )}
    </Window>
  );
};

export default SendForm;
