import React, { useState, useRef } from 'react';

import {
  Popup, Button, Input, Splash,
} from 'app/uikit';

import WalletSmallIcon from '@icons/icon-wallet-small.svg';
import { isNil } from '@app/core/utils';
import { useStore } from 'effector-react';
import {
  $error, checkPasswordFx, LoginPhase, setLoginPhase,
} from './model';

const LoginActive: React.FC = () => {
  const [warningVisible, toggleWarning] = useState(false);

  const pending = useStore(checkPasswordFx.pending);
  const error = useStore($error);

  const inputRef = useRef<HTMLInputElement>();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const { value } = inputRef.current;
    checkPasswordFx(value);
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
            disabled={pending}
            valid={isNil(error)}
            label={error}
            ref={inputRef}
          />
          <Button type="submit" disabled={pending} icon={WalletSmallIcon}>
            open your wallet
          </Button>
          <Button
            variant="link"
            disabled={pending}
            onClick={(event) => {
              event.preventDefault();
              toggleWarning(true);
            }}
          >
            Restore wallet or create a new one
          </Button>
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
        If you&apos;ll restore a wallet all transaction history and addresses will be
        lost
      </Popup>
    </>
  );
};

export default LoginActive;
