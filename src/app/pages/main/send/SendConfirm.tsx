/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';

import { GROTHS_IN_BEAM } from '@app/model/rates';

import {
  Window, Section, Button,
} from 'app/uikit';
import ArrowRightIcon from '@icons/icon-arrow-right.svg';

import { styled } from '@linaria/react';
import { useStore } from 'effector-react';

import {
  $form, onConfirmSubmit, $selected,
} from './model';

const WarningSyled = styled.p`
  opacity: 0.5;
  margin: 30px 0;
  text-align: center;
  font-style: italic;
`;

const Send = () => {
  const {
    fee,
    value,
    amount,
    change,
    address,
    offline,
    asset_id,
  } = useStore($form);

  const {
    available,
  } = useStore($selected);

  const remaining = asset_id === 0 ? available - fee - value : available - value;

  const txType = offline ? 'Offline' : 'Regular';

  return (
    <Window
      title="Send"
      pallete="purple"
    >
      <form onSubmit={onConfirmSubmit}>
        <Section title="Send to">{ address }</Section>
        <Section title="Transaction type">{ txType }</Section>
        <Section title="Amount">{ amount }</Section>
        <Section title="Transaction Fee">{ fee / GROTHS_IN_BEAM }</Section>
        <Section title="Change">{ change / GROTHS_IN_BEAM }</Section>
        <Section title="Remaining">{ remaining / GROTHS_IN_BEAM }</Section>
        <WarningSyled>
          For the transaction to complete, the recipient must get online
          within the next 12 hours and you should get online within 2 hours afterwards.
        </WarningSyled>
        <Button type="submit" pallete="purple" icon={ArrowRightIcon}>
          next
        </Button>
      </form>
    </Window>
  );
};

export default Send;
