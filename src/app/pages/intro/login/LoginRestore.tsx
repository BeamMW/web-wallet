import React, { useState } from 'react';
import { useStore } from 'effector-react';

import WasmWallet from '@core/WasmWallet';
import { setView, View } from '@app/model/view';
import { setSeed } from '@app/model/base';
import {
  Popup, Splash, Button,
} from 'app/uikit';

import addIcon from '@icons/icon-add.svg';

import { $phase, LoginPhase, setLoginPhase } from './model';

const LoginRestore: React.FC = () => {
  const [warningVisible, toggleWarning] = useState(false);
  const phase = useStore($phase);
  const active = phase === LoginPhase.RESTORE;

  const handleBackClick = () => {
    setLoginPhase(LoginPhase.ACTIVE);
  };

  return (
    <>
      <Splash
        blur={warningVisible}
        onBackClick={active ? handleBackClick : null}
      >
        <Button
          type="button"
          icon={addIcon}
          onClick={() => {
            setSeed(WasmWallet.getSeedPhrase());
            setView(View.CREATE);
          }}
        >
          create new wallet
        </Button>
        <Button
          variant="link"
          onClick={(event) => {
            event.preventDefault();
            toggleWarning(true);
          }}
        >
          Restore wallet
        </Button>
      </Splash>
      <Popup
        visible={warningVisible}
        title="Restore wallet"
        cancel="cancel"
        confirm="proceed"
        onCancel={() => {
          toggleWarning(false);
        }}
        onConfirm={() => {
          setView(View.RESTORE);
        }}
      >
        If you&apos;ll restore a wallet all transaction history and addresses will be
        lost
      </Popup>
    </>
  );
};

export default LoginRestore;
