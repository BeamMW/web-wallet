/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { styled } from '@linaria/react';

import { Window, Section, Button, Input, Toggle, Popup } from '@app/shared/components';

import { CopySmallIcon, IconQrCode, InfoButton } from '@app/shared/icons';

import AmountInput from '@app/shared/components/AmountInput';

import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@app/shared/constants';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectAddress,
  selectReceiveAmount,
  selectSbbs,
  selectSelectedAssetId,
} from '@app/containers/Wallet/store/selectors';
import { generateAddress, resetReceive, setReceiveAmount, setSbbs } from '@app/containers/Wallet/store/actions';
import { compact, copyToClipboard } from '@core/utils';
import { toast } from 'react-toastify';
import { AmountError } from '@app/containers/Wallet/constants';
import { TransactionAmount } from '@app/containers/Wallet/interfaces';
import { FullAddress } from '@app/containers';

const AddressStyled = styled.div`
  line-height: 24px;
`;
const AddressHint = styled.div`
  margin-top: 10px;
  opacity: 0.5;
  font-size: 14px;
  font-weight: normal;
  font-stretch: normal;
  font-style: italic;
  line-height: 1.14;
  letter-spacing: normal;
  color: #fff;
`;

const TipStyled = styled.div`
  line-height: 1.14;
  margin-top: 10px;
  font-family: SFProDisplay;
  font-size: 14px;
  font-style: italic;
  color: var(--color-gray);
`;

const WarningStyled = styled(TipStyled)`
  margin-bottom: 20px;
  text-align: center;
`;

const RowStyled = styled.div`
  display: flex;
`;

const LabelStyled = styled.label`
  flex-grow: 1;
`;

const QrCodeWrapper = styled.div`
  > .qr-cd {
    background: white;
    border-radius: 10px;
    padding: 5px;
    width: 230px;
    margin: 0 auto 30px;
  }
  > .text {
    opacity: 0.5;
    font-size: 14px;
    font-weight: normal;
    font-stretch: normal;
    font-style: italic;
    line-height: normal;
    letter-spacing: normal;
    text-align: center;
    color: #fff;
  }
`;

const Receive = () => {
  const dispatch = useDispatch();
  const [qrVisible, setQrVisible] = useState(false);
  const [showFullAddress, setShowFullAddress] = useState(false);
  const receiveAmount = useSelector(selectReceiveAmount());
  const addressFull = useSelector(selectAddress());
  const sbbs = useSelector(selectSbbs());
  const selected_asset_id = useSelector(selectSelectedAssetId());
  const address = compact(addressFull);
  const [amountError, setAmountError] = useState('');

  useEffect(
    () => () => {
      dispatch(resetReceive());
      dispatch(setSbbs(null));
    },
    [dispatch],
  );

  const { amount, asset_id } = receiveAmount;

  const [maxAnonymity, setMaxAnonymity] = useState(false);
  const [comment, setComment] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (selected_asset_id && Number(asset_id) !== selected_asset_id) {
      dispatch(setReceiveAmount({ amount, asset_id: selected_asset_id }));
    }
  }, [selected_asset_id, asset_id, amount, dispatch]);

  useEffect(() => {
    if (comment) {
      dispatch(generateAddress.request({ type: maxAnonymity ? 'max_privacy' : 'offline', comment }));
    } else {
      dispatch(
        generateAddress.request({
          type: maxAnonymity ? 'max_privacy' : 'offline',
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
      Number(send_amount.amount) < 0.00000001 &&
      Number(send_amount.amount) !== 0 &&
      send_amount.amount !== '' &&
      send_amount.asset_id === 0
    ) {
      setAmountError(AmountError.LESS);
    }

    dispatch(setReceiveAmount(send_amount));
  };

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
      <Popup
        visible={qrVisible}
        title=""
        onCancel={() => setQrVisible(false)}
        confirmButton={
          <Button icon={CopySmallIcon} pallete="blue" onClick={copyAndCloseQr}>
            copy and close
          </Button>
        }
        footerClass="qr-code-popup"
        cancelButton={null}
      >
        <QrCodeWrapper>
          <div className="qr-cd">
            <QRCode value={`${addressFull}`} size={220} bgColor="white" />
          </div>
          {maxAnonymity ? (
            <>
              <div className="text"> Transaction can last at most 72 hours.</div>
              <br />
              <div className="text">Min transaction fee is 0.01 BEAM.</div>
            </>
          ) : (
            <>
              <div className="text">Sender will be given a choice between regular and offline payment.</div>
              <br />
              <div className="text">
                For online payment to complete, you should get online during the 12 hours after coins are sent.
              </div>
            </>
          )}
        </QrCodeWrapper>
      </Popup>

      <Section title={`Address ${maxAnonymity ? '(Maximum anonymity)' : ''}`} variant="gray">
        <AddressStyled>
          {address}
          &nbsp;
          <Button variant="icon" pallete="white" icon={IconQrCode} onClick={() => setQrVisible(true)} />
          <Button variant="icon" pallete="white" icon={CopySmallIcon} onClick={copyAddress} />
          <Button
            className="full-address-button"
            variant="icon"
            pallete="white"
            icon={InfoButton}
            onClick={() => setShowFullAddress(true)}
          />
        </AddressStyled>
        {!maxAnonymity ? (
          <AddressHint>To ensure a better privacy, new address is generated every time.</AddressHint>
        ) : null}
      </Section>
      <Section title="requested amount (optional)" variant="gray">
        <AmountInput
          value={amount}
          asset_id={asset_id}
          pallete="blue"
          error={amountError}
          onChange={(e) => saveReceiveAmount(e)}
        />
      </Section>
      <Section title="Comment" variant="gray" collapse>
        <Input
          variant="gray"
          placeholder="Comment"
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
          }}
        />
      </Section>
      <Section title="Advanced" variant="gray" collapse>
        <RowStyled>
          <LabelStyled>Maximum anonymity set </LabelStyled>
          <Toggle id="ma" value={maxAnonymity} onChange={() => setMaxAnonymity((v) => !v)} />
        </RowStyled>
      </Section>

      {maxAnonymity ? (
        <WarningStyled>
          Transaction can last at most 72 hours.
          <br />
          <br />
          Min transaction fee is 0.01 BEAM.
        </WarningStyled>
      ) : (
        <WarningStyled>
          Sender will be given a choice between regular and offline payment.
          <br />
          <br />
          For online payment to complete, you should get online during the 12 hours after coins are sent.
        </WarningStyled>
      )}

      {/* <Section title="Comment" variant="gray" collapse>
          <Input variant="gray" />
        </Section> */}
      <Button pallete="blue" type="button" onClick={submitForm} disabled={!!amountError}>
        copy and close
      </Button>
    </Window>
  );
};

export default Receive;
