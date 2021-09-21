/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { useStore } from 'effector-react';
import { styled } from '@linaria/react';

import IconRemove from '@icons/icon-remove.svg';

import {
  Button,
  Window,
} from '@app/uikit';

const ContainerStyled = styled.div`
  margin: 0 -10px;
`;

const Settings = () => (
  <Window title="Settings">
    <ContainerStyled>
      <Button variant="block" pallete="red" icon={IconRemove}>Remove current wallet</Button>
    </ContainerStyled>
  </Window>
);

export default Settings;
