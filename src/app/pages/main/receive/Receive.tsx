/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect } from 'react';
import { styled } from '@linaria/react';
import { useStore } from 'effector-react';

import {
  Window, Section, Button, Input,
} from '@uikit';

import { CopySmallIcon } from '@app/icons';

import AmountInput from '@uikit/AmountInput';

import {
  $addressPreview,
  $amount,
  $asset,
  getAddressFx,
  onInputChange,
  copyAddress,
  copyAndClose,
} from './model';

const AddresStyled = styled.div`
  line-height: 24px;
`;

const Receive = () => {
  useEffect(() => {
    getAddressFx();
  }, []);

  const address = useStore($addressPreview);
  const amount = useStore($amount);
  const asset = useStore($asset);

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
        </Section>
        <Section title="Amount" variant="gray">
          <AmountInput
            value={amount}
            asset_id={asset}
            pallete="blue"
            onChange={onInputChange}
          />
        </Section>
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
