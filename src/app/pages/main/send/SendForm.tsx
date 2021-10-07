/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { useStore } from 'effector-react';

import { $rate, GROTHS_IN_BEAM } from '@app/model/rates';
import {
  Window, Section, Input, Button, Title,
} from 'app/uikit';
import ArrowRightIcon from '@icons/icon-arrow-right.svg';

import { AmountInput } from '@uikit';

import { styled } from '@linaria/react';
import { toUSD } from '@app/core/utils';
import LabeledToggle from '@app/uikit/LabeledToggle';
import {
  $valid,
  $address,
  $description,
  $addressValid,
  $selected,
  onAddressInput,
  onFormSubmit,
  $amountError,
  onInputChange,
  setOffline,
  $addressType,
  $offline,
  $amount,
  $currency,
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

const SendForm = () => {
  const address = useStore($address);
  const addressValid = useStore($addressValid);
  const addressType = useStore($addressType);
  const [label, warning] = useStore($description);

  const amount = useStore($amount);
  const amountError = useStore($amountError);
  const currency = useStore($currency);

  const selected = useStore($selected);
  const rate = useStore($rate);
  const valid = useStore($valid);
  const offline = useStore($offline);

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
            onInput={onAddressInput}
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
            index={currency}
            error={amountError}
            onChange={onInputChange}
          />
          <Title variant="subtitle">Available</Title>
          {`${groths} ${selected.metadata_pairs.N}`}
          { selected.asset_id === 0 && <Ratetyled>{toUSD(groths, rate)}</Ratetyled> }
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
