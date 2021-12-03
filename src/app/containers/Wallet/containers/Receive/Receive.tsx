/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { styled } from '@linaria/react';

import {
  Window, Section, Button, Input, Toggle,
} from '@app/shared/components';

import { CopySmallIcon } from '@app/shared/icons';

import AmountInput from '@app/shared/components/AmountInput';

import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@app/shared/constants';
import { useDispatch, useSelector } from 'react-redux';
import { selectAddress, selectReceiveAmount } from '@app/containers/Wallet/store/selectors';
import { generateAddress, resetReceive, setReceiveAmount } from '@app/containers/Wallet/store/actions';
import { compact, copyToClipboard } from '@core/utils';

const AddressStyled = styled.div`
  line-height: 24px;
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

const Receive = () => {
  const dispatch = useDispatch();
  const receiveAmount = useSelector(selectReceiveAmount());
  const addressFull = useSelector(selectAddress());

  const address = compact(addressFull);

  useEffect(() => () => {
    dispatch(resetReceive());
  }, [dispatch]);

  const { amount, asset_id } = receiveAmount;

  const [maxAnonymity, setMaxAnonymity] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(generateAddress.request({ type: maxAnonymity ? 'max_privacy' : 'offline' }));
  }, [dispatch, maxAnonymity]);

  const copyAddress = async () => {
    await copyToClipboard(addressFull);
  };

  const submitForm = async (e) => {
    await copyAddress();
    navigate(ROUTES.WALLET.BASE);
  };

  return (
    <Window title="Receive" pallete="blue">
      <form onSubmit={submitForm}>
        <Section title="Address" variant="gray">
          <AddressStyled>
            {address}
            &nbsp;
            <Button variant="icon" pallete="white" icon={CopySmallIcon} onClick={copyAddress} />
          </AddressStyled>
          <TipStyled>To ensure a better privacy, new address is generated every time.</TipStyled>
        </Section>
        <Section title="Amount" variant="gray">
          <AmountInput
            value={amount}
            asset_id={asset_id}
            pallete="blue"
            onChange={(e) => dispatch(setReceiveAmount(e))}
          />
        </Section>
        <Section title="Advanced" variant="gray" collapse>
          <RowStyled>
            <LabelStyled htmlFor="ma">Maximum anonymity set </LabelStyled>
            <Toggle id="ma" value={maxAnonymity} onChange={() => setMaxAnonymity((v) => !v)} />
          </RowStyled>
        </Section>
        {maxAnonymity ? (
          <WarningStyled>
            Transaction can last indefinitely.
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
        <Button pallete="blue" type="submit">
          copy and close
        </Button>
      </form>
    </Window>
  );
};

export default Receive;
