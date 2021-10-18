/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import * as extensionizer from 'extensionizer';
import { styled } from '@linaria/react';
import { getVersionFx, loadLogsFx, $version } from './model';
import { useStore } from 'effector-react';

import { RemoveIcon, SettingsReportIcon } from '@app/icons';
import { View, setView } from '@app/model/view';

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
  const versionData = useStore($version);
  const version = extensionizer.runtime.getManifest().version;

  const ReportClicked = () => {
    loadLogsFx();
    setView(View.SETTINGS_REPORT);
  }

  useEffect(() => {
    getVersionFx();
  }, []);

  return (
    <>
      <Window title="Settings" primary>
        <ContainerStyled>
          <VersionStyled>v { version } ({ versionData.beam_branch_name })</VersionStyled>
          <Button
            variant="block"
            pallete="white"
            icon={SettingsReportIcon}
            onClick={() => ReportClicked()}
          >
            Report a problem

          </Button>
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
