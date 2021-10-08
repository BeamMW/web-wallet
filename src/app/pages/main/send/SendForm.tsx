/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { useStore } from 'effector-react';

import { $rate, GROTHS_IN_BEAM } from '@app/model/rates';
import {
  Window, Section, Input, Button, Title,
} from 'app/uikit';
import ArrowRightIcon from '@icons/icon-arrow-right.svg';
import ArrowUpIcon from '@icons/icon-arrow-up.svg';

import { AmountInput } from '@uikit';

import { styled } from '@linaria/react';
import { toUSD } from '@app/core/utils';
import LabeledToggle from '@app/uikit/LabeledToggle';
import { css } from '@linaria/core';
import {
  $valid,
  $address,
  $description,
  $selected,
  onAddressChange,
  onFormSubmit,
  $amountError,
  onAmountChange,
  setOffline,
  setMaxAmount,
  $form,
} from './model';

const WarningStyled = styled.div`
  margin: 30px -20px;
  font-family: 'SFProDisplay';
  font-style: italic;
  color: var(--color-gray);
`;

const Ratetyled = styled.div`
  margin-top: 4px;
  color: var(--color-gray);
`;

const maxButtonStyle = css`
  position: absolute;
  right: 20px;
  top: 138px;
`;

const SendForm = () => {
  const {
    amount,
    address,
    offline,
    asset_id,
  } = useStore($form);

  const {
    type: addressType,
    is_valid: addressValid,
  } = useStore($address);

  const amountError = useStore($amountError);

  const [label, warning] = useStore($description);

  const selected = useStore($selected);
  const rate = useStore($rate);
  const valid = useStore($valid);

  const groths = selected.available / GROTHS_IN_BEAM;

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
            valid={address === '' || addressValid}
            placeholder="Paste recipient address here"
            value={address}
            onInput={onAddressChange}
          />
        </Section>
        { addressType === 'offline' && (
        <Section title="Transaction Type" variant="gray">
          <LabeledToggle left="Online" right="Offline" value={offline} onChange={setOffline} />
        </Section>
        ) }
        <Section title="Amount" variant="gray">
          <AmountInput
            value={amount}
            asset_id={asset_id}
            error={amountError}
            onChange={onAmountChange}
          />
          <Title variant="subtitle">Available</Title>
          {`${groths} ${selected.metadata_pairs.N}`}
          { selected.asset_id === 0 && <Ratetyled>{toUSD(groths, rate)}</Ratetyled> }
          <Button
            variant="link"
            icon={ArrowUpIcon}
            pallete="purple"
            className={maxButtonStyle}
            onClick={setMaxAmount}
          >
            max
          </Button>
        </Section>
        <Section title="Comment" variant="gray" collapse>
          <Input variant="gray" />
        </Section>
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
