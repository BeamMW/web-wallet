import React, { useState } from 'react';
import { useStore } from 'effector-react';

import WasmWallet from '@core/WasmWallet';
import { $phase, setSeed } from '@state/intro';
import { setView, View } from '@state/shared';
import { setLoginPhase, LoginPhase } from '@state/intro';

import { Popup, Splash, Button, Link } from '@pages/shared';

const wallet = WasmWallet.getInstance();

const LoginRestore: React.FC = () => {
  const [warningVisible, toggleWarning] = useState(false);
  const phase = useStore($phase);
  const active = phase === LoginPhase.RESTORE;

  return (
    <>
      <Splash blur={warningVisible}>
        {active && (
          <button
            type="button"
            onClick={() => {
              setLoginPhase(LoginPhase.ACTIVE);
            }}
          >
            back
          </button>
        )}
        <Button
          type="button"
          icon="add"
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
