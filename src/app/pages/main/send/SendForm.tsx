/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { useStore } from 'effector-react';

import { setView, View } from '@app/model';
import {
  Window, Section, Input, Button,
} from 'app/uikit';
import ArrowIcon from '@icons/icon-arrow.svg';

import Amount from './Amount';

import {
  $valid,
  $address,
  $addressLabel,
  $addressValid,
  gotoConfirm,
  gotoPortfolio,
  onAddressInput,
} from './model';

const Send = () => {
  const address = useStore($address);
  const addressValid = useStore($addressValid);
  const addressLabel = useStore($addressLabel);
  const valid = useStore($valid);

  return (
    <Window
      title="Send"
      pallete="purple"
      onBackClick={gotoPortfolio}
    >
      <form onSubmit={gotoConfirm}>
        <Section title="Send to" variant="gray">
          <Input
            variant="gray"
            label={addressLabel}
            valid={addressValid}
            placeholder="Paste recipient address here"
            value={address}
            onInput={onAddressInput}
          />
        </Section>
        <Amount />
        <Section title="Comment" variant="gray">
          <Input variant="gray" />
        </Section>
        <Button
          pallete="purple"
          icon={ArrowIcon}
          type="submit"
          disabled={!valid}
        >
          next
        </Button>
      </form>
    </Window>
  );
};

export default Send;
