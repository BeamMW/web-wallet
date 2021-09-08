/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect } from 'react';
import { useStore } from 'effector-react';

import { gotoWallet } from '@app/model/view';

import {
  Window, Section, Button,
} from 'app/uikit';

import { $addressMine, getAddressFx } from './model';

const SendForm = () => {
  useEffect(() => {
    getAddressFx();
  }, []);

  const address = useStore($addressMine);

  return (
    <Window
      title="Send"
      pallete="blue"
      onBackClick={gotoWallet}
    >
      <form>
        <Section title="Address" variant="gray">
          { address }
        </Section>
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

export default SendForm;
