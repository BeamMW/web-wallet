/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { useStore } from 'effector-react';
import { styled } from '@linaria/react';

import IconRemove from '@icons/icon-remove.svg';

import {
  Button,
  Window,
} from '@app/uikit';
import RemovePopup from './RemovePopup';

const ContainerStyled = styled.div`
  margin: 0 -10px;
`;

const Settings = () => {
  const [warningVisible, toggleWarning] = useState(false);

  return (
    <>
      <Window title="Settings">
        <ContainerStyled>
          <Button
            variant="block"
            pallete="red"
            icon={IconRemove}
            onClick={() => toggleWarning(true)}
          >
            Remove current wallet

          </Button>
        </ContainerStyled>
      </Window>
      <RemovePopup
        visible={warningVisible}
        onCancel={() => toggleWarning(false)}
      />
    </>
  );
};

export default Settings;
