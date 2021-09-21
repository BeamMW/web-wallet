import React, { useState, useEffect } from 'react';
import { useStore } from 'effector-react';

import WalletController from '@app/core/WalletController';
import { setView, View } from '@app/model/view';
import { setSeed } from '@app/model/base';
import {
  Popup, Splash, Button,
} from 'app/uikit';

import addIcon from '@icons/icon-add.svg';

import { $phase, LoginPhase, setLoginPhase } from './model';

const walletController = WalletController.getInstance();

const LoginRestore: React.FC = () => {
  let seed = null;
  useEffect(() => {
    (async () => {
      seed = await walletController.getSeedPhrase();
    })();
  });

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
          icon={addIcon}
          onClick={() => {
            setSeed(seed);
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
