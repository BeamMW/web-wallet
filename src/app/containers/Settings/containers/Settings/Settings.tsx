// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react';
import * as extensionizer from 'extensionizer';
import { styled } from '@linaria/react';

import { RemoveIcon, SettingsReportIcon, SettingsConnectedSites } from '@app/shared/icons';

import { ROUTES } from '@app/shared/constants';

import {
  Button, Input, LabeledToggle, Popup, Window,
} from '@app/shared/components';
import { useNavigate } from 'react-router-dom';
import { setError } from '@app/shared/store/actions';
import { useDispatch, useSelector } from 'react-redux';
import { loadLogs, loadVersion, loadConnectedSites } from '@app/containers/Settings/store/actions';
import { selectVersion } from '@app/containers/Settings/store/selectors';
import {
  clearSavedPassword,
  getSavePasswordSetting,
  savePassword,
  setSavePasswordSetting,
} from '@core/RememberPassword';
import WasmWallet, { ErrorMessage } from '@core/WasmWallet';
import { RemovePopup } from '../../components';

const ContainerStyled = styled.div`
  margin: 0;
`;

const SectionStyled = styled.div`
  margin: 12px 0 18px 0;
  padding: 14px 12px;
  clip-path: var(--cp-clip);
  border: 1px solid var(--cp-line);
  background: rgba(255, 255, 255, 0.015);
`;

const RowStyled = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const TitleStyled = styled.div`
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--cp-text);
`;

const HintStyled = styled.div`
  margin-top: 8px;
  font-size: 12px;
  line-height: 16px;
  color: var(--cp-muted);
`;

const VersionStyled = styled.div`
  text-align: end;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--cp-muted);
  margin-bottom: 18px;
`;

const Settings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [savePasswordEnabled, setSavePasswordEnabled] = React.useState(false);
  const [confirmSavePasswordVisible, setConfirmSavePasswordVisible] = React.useState(false);
  const [savePasswordInput, setSavePasswordInput] = React.useState('');
  const [savePasswordError, setSavePasswordError] = React.useState<string | null>(null);
  const [savePasswordBusy, setSavePasswordBusy] = React.useState(false);

  React.useEffect(() => {
    dispatch(loadVersion.request());
  }, [dispatch]);

  React.useEffect(() => {
    dispatch(loadConnectedSites.request());
  }, [dispatch]);

  React.useEffect(() => {
    getSavePasswordSetting()
      .then(setSavePasswordEnabled)
      .catch(() => setSavePasswordEnabled(false));
  }, []);

  const [warningVisible, toggleWarning] = React.useState(false);
  const versionData = useSelector(selectVersion());

  const manifest = extensionizer.runtime.getManifest();

  const ReportClicked = () => {
    dispatch(loadLogs.request());
    navigate(ROUTES.SETTINGS.SETTINGS_REPORT);
  };

  const ConnectedSitesClicked = () => {
    navigate(ROUTES.SETTINGS.SETTINGS_CONNECTED);
  };

  const version = `v ${manifest.version}`;

  return (
    <>
      <Window title="Settings" primary>
        <ContainerStyled>
          <VersionStyled>{version}</VersionStyled>

          <SectionStyled>
            <RowStyled>
              <TitleStyled>Save password (session)</TitleStyled>
              <LabeledToggle
                left="off"
                right="on"
                value={savePasswordEnabled}
                onChange={(next) => {
                  if (next) {
                    setConfirmSavePasswordVisible(true);
                    return;
                  }
                  setSavePasswordEnabled(false);
                  setSavePasswordSetting(false);
                  clearSavedPassword();
                }}
              />
            </RowStyled>
            <HintStyled>
              When enabled, your wallet password is kept only for the current browser session (cleared on lock, wallet
              removal, or browser restart). It is not written to persistent storage.
            </HintStyled>
          </SectionStyled>

          <Button variant="block" pallete="white" icon={SettingsReportIcon} onClick={() => ReportClicked()}>
            Report a problem
          </Button>
          <Button variant="block" pallete="white" icon={SettingsConnectedSites} onClick={() => ConnectedSitesClicked()}>
            Connected sites
          </Button>
          <Button
            variant="block"
            pallete="red"
            icon={RemoveIcon}
            onClick={() => {
              dispatch(setError(null));
              toggleWarning(true);
            }}
          >
            Remove current wallet
          </Button>
        </ContainerStyled>
      </Window>
      <Popup
        visible={confirmSavePasswordVisible}
        title="Enable session password saving"
        cancelButton={(
          <Button
            variant="ghost"
            onClick={() => {
              setConfirmSavePasswordVisible(false);
              setSavePasswordInput('');
              setSavePasswordError(null);
            }}
          >
            cancel
          </Button>
        )}
        confirmButton={(
          <Button
            pallete="white"
            disabled={savePasswordBusy || !savePasswordInput}
            onClick={async () => {
              try {
                setSavePasswordBusy(true);
                setSavePasswordError(null);

                await WasmWallet.checkPassword(savePasswordInput);
                await setSavePasswordSetting(true);
                await savePassword(savePasswordInput);

                setConfirmSavePasswordVisible(false);
                setSavePasswordEnabled(true);
                setSavePasswordInput('');
              } catch (e) {
                setSavePasswordError((e as ErrorMessage) || 'Invalid password');
              } finally {
                setSavePasswordBusy(false);
              }
            }}
          >
            {savePasswordBusy ? 'enabling…' : 'enable'}
          </Button>
        )}
        onCancel={() => setConfirmSavePasswordVisible(false)}
      >
        <p style={{ marginTop: 0 }}>
          Enter your wallet password once. It will be cached only for the current browser session to allow auto-unlock
          after extension reloads.
        </p>
        <Input
          label={savePasswordError || 'Password'}
          type="password"
          valid={!savePasswordError}
          autoFocus
          value={savePasswordInput}
          onChange={(e) => {
            setSavePasswordError(null);
            setSavePasswordInput((e.target as HTMLInputElement).value);
          }}
        />
      </Popup>
      <RemovePopup visible={warningVisible} onCancel={() => toggleWarning(false)} />
    </>
  );
};

export default Settings;
