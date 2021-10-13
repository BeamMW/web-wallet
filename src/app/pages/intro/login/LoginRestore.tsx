import React, { useState } from 'react';
import { useStore } from 'effector-react';

import { setView, View } from '@app/model/view';
import {
  Popup, Splash, Button,
} from 'app/uikit';

import {
  AddIcon,
  DoneIcon,
} from '@app/icons';

import { $phase, LoginPhase, setLoginPhase } from './model';

const LoginRestore: React.FC = () => {
  const [warningVisible, toggleWarning] = useState(false);
  const phase = useStore($phase);
  const active = phase === LoginPhase.RESTORE;

  const handleReturn = () => {
    setLoginPhase(LoginPhase.ACTIVE);
  };

  return (
    <>
      <Splash
        blur={warningVisible}
        onReturn={active ? handleReturn : null}
      >
        <Button
          type="button"
          icon={AddIcon}
          onClick={() => setView(View.SEED_WARNING)}
        >
          create new wallet
        </Button>
        <Button
          variant="link"
          onClick={() => toggleWarning(true)}
        >
          Restore wallet
        </Button>
      </Splash>
      <Popup
        visible={warningVisible}
        title="Restore wallet"
        confirmButton={(
          <Button
            icon={DoneIcon}
            onClick={() => setView(View.RESTORE)}
          >
            I agree
          </Button>
        )}
        onCancel={() => toggleWarning(false)}
      >
        You are trying to restore an existing Beam Wallet.
        <br />
        Please notice that if you use your wallet on another device,
        your balance will be up to date, but transaction history
        and addresses will be kept separately on each device.
      </Popup>
    </>
  );
};

export default LoginRestore;
