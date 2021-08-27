import React, { useState } from 'react';
import { useStore } from 'effector-react';

import WasmWallet from '@core/WasmWallet';
import { $phase, setSeed } from '@state/intro';
import { setView, View } from '@state/shared';
import { setLoginPhase, LoginPhase } from '@state/intro';
import { Popup, Splash, Button, Link } from 'app/uikit';

import addIcon from '@icons/icon-add.svg';

const wallet = WasmWallet.getInstance();

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
            setSeed(wallet.getSeedPhrase());
            setView(View.CREATE);
          }}
        >
          create new wallet
        </Button>
        <Link
          onClick={event => {
            event.preventDefault();
            toggleWarning(true);
          }}
        >
          Restore wallet
        </Link>
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
        If you'll restore a wallet all transaction history and addresses will be
        lost
      </Popup>
    </>
  );
};

export default LoginRestore;
