import React, { useState, useRef } from 'react';

import WasmWallet from '@core/WasmWallet';
import { setView, View, ErrorMessage } from '@state/shared';
import { setLoginPhase, LoginPhase } from '@state/intro';
import { Popup, Button, Link, Input, Splash } from '@pages/shared';
import { styled } from '@linaria/react';

const wallet = WasmWallet.getInstance();

const LoginActive: React.FC = () => {
  const [error, setError] = useState<ErrorMessage>(null);
  const [warningVisible, toggleWarning] = useState(false);

  const inputRef = useRef<HTMLInputElement>();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const { value } = inputRef.current;

    if (value === '') {
      setError(ErrorMessage.EMPTY);
      return;
    }

    try {
      await wallet.checkPassword(value);
      setError(null);
      setView(View.PROGRESS);
      wallet.open(value);
    } catch {
      setError(ErrorMessage.INVALID);
    }
  }

  return (
    <>
      <Splash size="small">
        <form autoComplete="off" noValidate onSubmit={handleSubmit}>
          <p>Enter your password to access the wallet</p>
          <Input
            autoFocus
            name="password"
            type="password"
            placeholder="Password"
            margin="large"
            error={error}
            ref={inputRef}
          />
          <Button type="submit">open your wallet</Button>
          <Link
            onClick={event => {
              event.preventDefault();
              toggleWarning(true);
            }}
          >
            Restore wallet or create a new one
          </Link>
        </form>
      </Splash>

      <Popup
        visible={warningVisible}
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
        If you'll restore a wallet all transaction history and addresses will be
        lost
      </Popup>
    </>
  );
};

export default LoginActive;
