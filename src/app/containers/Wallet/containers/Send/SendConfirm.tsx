/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';

import { Section, Button, Rate } from '@app/shared/components';

import { ArrowUpIcon } from '@app/shared/icons';

import { styled } from '@linaria/react';

import {
  fromGroths, compact, toGroths, getTxType, truncate,
} from '@core/utils';
import { AddressData } from '@core/types';
import { AssetTotal, TransactionAmount } from '@app/containers/Wallet/interfaces';

const BeamAmount = styled.p`
  font-weight: bold;
  color: var(--color-violet);
  margin: 0;
`;

interface SendConfirmProps {
  address: string;
  offline: boolean;
  send_amount: TransactionAmount;
  selected: AssetTotal;
  beam: AssetTotal;
  addressData: AddressData;
  fee: number;
  change: number;
  asset_change: number;
  submitSend: () => void;
}

const SendConfirm = (props: SendConfirmProps) => {
  const {
    address, offline, send_amount, selected, addressData, fee, change, submitSend, beam, asset_change,
  } = props;

  const { asset_id, amount } = send_amount;

  const value = toGroths(parseFloat(amount));

  const { available, metadata_pairs } = selected;

  const { type: addressType } = addressData;

  const remaining = asset_id === 0 ? available - fee - value : available - value;

  const txType = getTxType(addressType, offline);

  const beamRemaining = beam.available - fee;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submitSend();
      }}
    >
      <Section subtitle="Send to">{compact(address)}</Section>
      <Section subtitle="Transaction type">{txType}</Section>
      <Section subtitle="Amount">
        <BeamAmount>
          {fromGroths(value)}
          &nbsp;
          {truncate(metadata_pairs.UN)}
        </BeamAmount>
        {selected.asset_id === 0 && <Rate value={value} groths />}
      </Section>
      <Section subtitle="Transaction Fee">
        {fromGroths(fee)}
        &nbsp;BEAM
        <Rate value={fee} groths />
      </Section>
      <Section subtitle="Change">
        {fromGroths(selected.asset_id === 0 ? change : asset_change)}
        &nbsp;
        {truncate(metadata_pairs.UN)}
        <Rate value={selected.asset_id === 0 ? change : asset_change} groths />
      </Section>
      <Section subtitle="Remaining">
        {fromGroths(remaining)}
        &nbsp;
        {truncate(metadata_pairs.UN)}
        <Rate value={remaining} groths />
      </Section>
      {selected.asset_id !== 0 && (
        <Section subtitle="Beam Remaining">
          {fromGroths(beamRemaining)}
          &nbsp;BEAM
          <Rate value={beamRemaining} groths />
        </Section>
      )}
      <Button type="submit" pallete="purple" icon={ArrowUpIcon} style={{ marginTop: '30px' }}>
        send
      </Button>
    </form>
  );
};

export default SendConfirm;
