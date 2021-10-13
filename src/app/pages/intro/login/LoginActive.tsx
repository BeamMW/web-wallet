import React, { useState, useRef } from 'react';
import { useStore } from 'effector-react';

import {
  Popup, Button, Input, Splash,
} from '@uikit';

import { isNil } from '@app/core/utils';

import {
  WalletSmallIcon,
  DoneIcon,
} from '@app/icons';

import {
  $error, startWalletFx, LoginPhase, setLoginPhase,
} from './model';

const LoginActive: React.FC = () => {
  const [warningVisible, toggleWarning] = useState(false);

  const pending = useStore(startWalletFx.pending);
  const error = useStore($error);

  const inputRef = useRef<HTMLInputElement>();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const { value } = inputRef.current;
    startWalletFx(value);
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
        confirmButton={(
          <Button
            icon={DoneIcon}
            onClick={() => setLoginPhase(LoginPhase.RESTORE)}
          >
            I agree
          </Button>
        )}
        onCancel={() => {
          toggleWarning(false);
        }}
      >
        If you&apos;ll restore a wallet all transaction history and addresses will be
        lost
      </Popup>
    </>
  );
};

export default LoginActive;
