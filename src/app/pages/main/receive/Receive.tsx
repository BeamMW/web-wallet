/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect } from 'react';
import { useStore } from 'effector-react';

import {
  Window, Section, Button,
} from 'app/uikit';

import {
  $addressPreview,
  getAddressFx,
  onSubmit,
} from './model';

const Receive = () => {
  useEffect(() => {
    getAddressFx();
  }, []);

  const address = useStore($addressPreview);

  return (
    <Window
      title="Send"
      pallete="blue"
    >
      <form onSubmit={onSubmit}>
        <Section title="Address" variant="gray">
          { address }
          &nbsp;
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

export default Receive;
