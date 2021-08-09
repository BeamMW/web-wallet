import React, { useState } from 'react';
import { useStore } from 'effector-react';

import WasmWallet from '@wallet';
import { $phase, setSeed } from '@state/intro';
import { setView, View } from '@state/shared';
import { setLoginPhase, LoginPhase } from '@state/intro';

import { Popup } from '@pages/shared';

const wallet = WasmWallet.getInstance();

const LoginRestore: React.FC = () => {
  const [warningVisible, toggleWarning] = useState(false);
  const phase = useStore($phase);
  const active = phase === LoginPhase.RESTORE;

  return (
    <div>
      <div>
        {warningVisible && (
          <Popup
            title="Restore wallet"
            confirm="agree"
            onCancel={() => {
              toggleWarning(false);
            }}
            onConfirm={() => {
              setView(View.RESTORE);
            }}
          >
            <p>
              If you'll restore a wallet all transaction history and addresses
              will be lost
            </p>
          </Popup>
        )}
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
        <button
          type="button"
          onClick={() => {
            setSeed(wallet.getSeedPhrase());
            setView(View.CREATE);
          }}
        >
          create new wallet
        </button>
      </div>
      <div>
        <button
          type="button"
          onClick={() => {
            toggleWarning(true);
          }}
        >
          Restore wallet
        </button>
      </div>
    </div>
  );
};

export default LoginRestore;
