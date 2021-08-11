import React, { useState, useRef } from 'react';

import WasmWallet from '@core/WasmWallet';
import { setView, View } from '@state/shared';
import { setLoginPhase, LoginPhase } from '@state/intro';
import { Popup } from '@pages/shared';

const wallet = WasmWallet.getInstance();

const LoginActive: React.FC = () => {
  const [error, setError] = useState(false);
  const [warningVisible, toggleWarning] = useState(false);

  const inputRef = useRef<HTMLInputElement>();

  const handleSubmit: React.FormEventHandler = async event => {
    event.preventDefault();
    const { value } = inputRef.current;
    try {
      await wallet.checkPassword(value);
      wallet.open(value);
      setError(false);
      setView(View.PROGRESS);
    } catch {
      setError(true);
    }
  };

  return (
    <>
      {warningVisible && (
        <Popup
          title="Restore wallet or create a new one"
          cancel="cancel"
          confirm="proceed"
          onCancel={() => {
            toggleWarning(false);
          }}
          onConfirm={() => {
            setLoginPhase(LoginPhase.RESTORE);
          }}
        >
          <p>
            If you'll restore a wallet all transaction history and addresses
            will be lost
          </p>
        </Popup>
      )}
      <form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <div>
          <input
            autoFocus
            name="password"
            type="password"
            placeholder="Password"
            ref={inputRef}
          />
        </div>
        {error && <div>Invalid password provided</div>}
        <div>
          <button type="submit">open your wallet</button>
        </div>
        <div>
          <button
            type="button"
            onClick={() => {
              toggleWarning(true);
            }}
          >
            Restore wallet or create a new one
          </button>
        </div>
      </form>
    </>
  );
};

export default LoginActive;
