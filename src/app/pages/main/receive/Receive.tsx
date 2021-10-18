/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect } from 'react';
import { styled } from '@linaria/react';
import { useStore } from 'effector-react';

import {
  Window, Section, Button, Input, Toggle,
} from '@uikit';

import { CopySmallIcon } from '@app/icons';

import AmountInput from '@uikit/AmountInput';

import {
  $addressPreview,
  $amount,
  createAddressFx,
  setAmount,
  copyAddress,
  copyAndClose,
  $maxAnonymity,
  onToggleChange,
} from './model';

const AddresStyled = styled.div`
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
  const address = useStore($addressPreview);
  const maxAnonimity = useStore($maxAnonymity);
  const [amount, asset_id] = useStore($amount);

  useEffect(() => {
    createAddressFx({ type: maxAnonimity ? 'max_privacy' : 'offline' });
  }, [maxAnonimity]);

  return (
    <Window
      title="Receive"
      pallete="blue"
    >
      <form onSubmit={copyAndClose}>
        <Section title="Address" variant="gray">
          <AddresStyled>
            { address }
            &nbsp;
            <Button
              variant="icon"
              pallete="white"
              icon={CopySmallIcon}
              onClick={copyAddress}
            />
          </AddresStyled>
          <TipStyled>
            To ensure a better privacy, new address is generated every time.
          </TipStyled>
        </Section>
        <Section title="Amount" variant="gray">
          <AmountInput
            value={amount}
            asset_id={asset_id}
            pallete="blue"
            onChange={setAmount}
          />
        </Section>
        <Section title="Advanced" variant="gray" collapse>
          <RowStyled>
            <LabelStyled htmlFor="ma">Maximum anonymity set </LabelStyled>
            <Toggle
              id="ma"
              value={maxAnonimity}
              onChange={onToggleChange}
            />
          </RowStyled>
        </Section>
        { maxAnonimity ? (
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
            For online payment to complete,
            you should get online during the 12 hours after coins are sent.
          </WarningStyled>
        )}

        {/* <Section title="Comment" variant="gray" collapse>
          <Input variant="gray" />
        </Section> */}
        <Button
          pallete="blue"
          type="submit"
        >
          copy and close
        </Button>
      </form>
    </Window>
  );
};

export default Receive;
