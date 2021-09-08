/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect } from 'react';
import { useStore } from 'effector-react';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';

import { gotoWallet, GROTHS_IN_BEAM } from '@app/model';
import {
  Window, Section, Input, Button, Title, Select,
} from 'app/uikit';
import ArrowIcon from '@icons/icon-arrow.svg';

import { isNil } from '@app/core/utils';
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
