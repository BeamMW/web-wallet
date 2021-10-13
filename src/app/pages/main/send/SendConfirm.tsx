/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';

import {
  Window, Section, Button, Rate,
} from 'app/uikit';

import {
  ArrowRightIcon,
} from '@app/icons';

import { styled } from '@linaria/react';
import { useStore } from 'effector-react';

import { fromGroths, compact } from '@app/core/utils';
import { AddressType } from '@app/core/types';
import {
  $form, onConfirmSubmit, $selected, $description, $change, $addressData,
} from './model';

const WarningSyled = styled.p`
  opacity: 0.5;
  margin: 30px 0;
  text-align: center;
  font-style: italic;
`;

const getTxType = (type: AddressType, offline: boolean): string => {
  if (type === 'max_privacy') {
    return 'Max Privacy';
  }

  return offline ? 'Offline' : 'Regular';
};

const Send = () => {
  const {
    value,
    address,
    offline,
    asset_id,
  } = useStore($form);

  const { available, metadata_pairs } = useStore($selected);
  const [fee, change] = useStore($change);
  const [, warning] = useStore($description);
  const { type: addressType } = useStore($addressData);

  const remaining = asset_id === 0 ? available - fee - value : available - value;

  const txType = getTxType(addressType, offline);

  return (
    <Window
      title="Send"
      pallete="purple"
    >
      <form onSubmit={onConfirmSubmit}>
        <Section subtitle="Send to">{ compact(address) }</Section>
        <Section subtitle="Transaction type">{ txType }</Section>
        <Section subtitle="Amount">
          { fromGroths(value) }
          &nbsp;
          { metadata_pairs.UN }
        </Section>
        <Section subtitle="Transaction Fee">
          { fromGroths(fee) }
          &nbsp;BEAM
          <Rate value={fee} groths />
        </Section>
        <Section subtitle="Change">
          { fromGroths(change) }
          &nbsp;BEAM
          <Rate value={change} groths />
        </Section>
        <Section subtitle="Remaining">
          { fromGroths(remaining) }
          { asset_id === 0 && (
            <Rate value={remaining} groths />
          ) }
        </Section>
        <WarningSyled>{ warning }</WarningSyled>
        <Button type="submit" pallete="purple" icon={ArrowRightIcon}>
          next
        </Button>
      </form>
    </Window>
  );
};

export default Send;
