/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { styled } from '@linaria/react';
import { getVersionFx, $version } from './model';
import { useStore } from 'effector-react';

import { RemoveIcon } from '@app/icons';

import {
  Button,
  Window,
} from '@app/uikit';
import RemovePopup from './RemovePopup';

const ContainerStyled = styled.div`
  margin: 0 -10px;
`;

const VersionStyled = styled.div`
  text-align: end;
  color: rgba(255,255,255, .7);
  margin-bottom: 20px;
`;

const Settings = () => {
  const [warningVisible, toggleWarning] = useState(false);
  const version = useStore($version);

  useEffect(() => {
    getVersionFx();
  }, []);

  return (
    <>
      <Window title="Settings" primary>
        <ContainerStyled>
          <VersionStyled>v { version.beam_version } ({ version.beam_branch_name })</VersionStyled>
          <Button
            variant="block"
            pallete="red"
            icon={RemoveIcon}
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
