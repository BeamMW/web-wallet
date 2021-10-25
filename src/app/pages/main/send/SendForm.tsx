/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { useStore } from 'effector-react';

import {
  Window, Section, Input, Button, Title, Rate,
} from 'app/uikit';

import {
  ArrowRightIcon,
  ArrowUpIcon,
} from '@app/icons';

import { AmountInput } from '@uikit';

import { styled } from '@linaria/react';
import LabeledToggle from '@app/uikit/LabeledToggle';
import { css } from '@linaria/core';
import { fromGroths, isNil, truncate } from '@app/core/utils';
import {
  $address,
  $offline,
  $amount,
  $comment,

  onAddressChange,
  onCommentChange,

  setOffline,
  setAmount,
  setMaxAmount,
  onFormSubmit,

  $valid,
  $selected,
  $addressData,
  $description,
  $amountError,
} from './model';

const WarningStyled = styled.div`
  margin: 30px -20px;
  font-family: 'SFProDisplay';
  font-style: italic;
  color: var(--color-gray);
`;

const maxButtonStyle = css`
  position: absolute;
  right: 20px;
  top: 138px;
`;

const SendForm = () => {
  const address = useStore($address);
  const offline = useStore($offline);
  // const comment = useStore($comment);
  const [amount, asset_id] = useStore($amount);

  const {
    type: addressType,
    is_valid: addressValid,
  } = useStore($addressData);

  const amountError = useStore($amountError);

  const [label, warning] = useStore($description);

  const selected = useStore($selected);
  const valid = useStore($valid);

  const groths = fromGroths(selected.available);

  return (
    <Window
      title="Send"
      pallete="purple"
    >
      <form onSubmit={onFormSubmit}>
        <Section title="Send to" variant="gray">
          <Input
            variant="gray"
            label={label}
            valid={address === '' || label === null || addressValid}
            placeholder="Paste recipient address here"
            value={address}
            onInput={onAddressChange}
          />
        </Section>
        { addressType === 'offline' && (
        <Section title="Transaction Type" variant="gray">
          <LabeledToggle
            left="Online"
            right="Offline"
            value={offline}
            onChange={setOffline}
          />
        </Section>
        ) }
        <Section title="Amount" variant="gray">
          <AmountInput
            value={amount}
            asset_id={asset_id}
            error={amountError}
            onChange={setAmount}
          />
          <Title variant="subtitle">Available</Title>
          {`${groths} ${truncate(selected.metadata_pairs.N)}`}
          { selected.asset_id === 0 && isNil(amountError) && <Rate value={groths} /> }
          { groths > 0 && (
            <Button
              icon={ArrowUpIcon}
              variant="link"
              pallete="purple"
              className={maxButtonStyle}
              onClick={setMaxAmount}
            >
              max
            </Button>
          )}
        </Section>
        {/* <Section title="Comment" variant="gray" collapse>
          <Input
            variant="gray"
            value={comment}
            onInput={onCommentChange}
          />
        </Section> */}
        <WarningStyled>{ warning }</WarningStyled>
        <Button
          pallete="purple"
          icon={ArrowRightIcon}
          type="submit"
          disabled={!valid}
        >
          next
        </Button>
      </form>
    </Window>
  );
};

export default SendForm;
