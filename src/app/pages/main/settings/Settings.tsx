/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import * as extensionizer from 'extensionizer';
import { styled } from '@linaria/react';
import { useStore } from 'effector-react';

import { RemoveIcon, SettingsReportIcon } from '@app/icons';
import { View, setView } from '@app/model/view';

import {
  Button,
  Window,
} from '@app/uikit';
import {
  getVersionFx, loadLogsFx, $version, resetError,
} from './model';
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
  useEffect(() => {
    getVersionFx();
  }, []);

  const [warningVisible, toggleWarning] = useState(false);
  const versionData = useStore($version);
  const manifest = extensionizer.runtime.getManifest();

  const ReportClicked = () => {
    loadLogsFx();
    setView(View.SETTINGS_REPORT);
  };

  const version = `v ${manifest.version} (${versionData.beam_branch_name})`;

  return (
    <>
      <Window title="Settings" primary>
        <ContainerStyled>
          <VersionStyled>
            { version }
          </VersionStyled>
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
            onClick={() => {
              resetError();
              toggleWarning(true);
            }}
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
