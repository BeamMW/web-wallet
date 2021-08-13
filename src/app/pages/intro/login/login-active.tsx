import React, { useState, useRef } from 'react';

import WasmWallet from '@core/WasmWallet';
import { setView, View } from '@state/shared';
import { setLoginPhase, LoginPhase } from '@state/intro';
import { Popup, Button, Link, Input, Logo } from '@pages/shared';
import { styled } from '@linaria/react';

const wallet = WasmWallet.getInstance();

const FormStyled = styled.form`
  padding: 0 30px;
  text-align: center;
`;

const PaddingStyled = styled.div`
  margin: 30px 0;
`;

enum ErrorMessage {
  INVALID = 'Invalid password provided',
  EMPTY = 'Please, enter password',
}

const LoginActive: React.FC = () => {
  const [error, setError] = useState<ErrorMessage>(null);
  const [warningVisible, toggleWarning] = useState(false);

  const inputRef = useRef<HTMLInputElement>();

  const handleSubmit: React.FormEventHandler = async event => {
    event.preventDefault();
    const { value } = inputRef.current;

    if (value === '') {
      setError(ErrorMessage.EMPTY);
      return;
    }

    try {
      await wallet.checkPassword(value);
      wallet.open(value);
      setError(null);
      setView(View.PROGRESS);
    } catch {
      setError(ErrorMessage.INVALID);
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
      <FormStyled autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Logo />
        <p>Enter your password to access the wallet</p>
        <div>
          <Input
            autoFocus
            name="password"
            type="password"
            placeholder="Password"
            error={error}
            ref={inputRef}
          />
        </div>
        <div>
          <Button type="submit">open your wallet</Button>
        </div>
        <PaddingStyled>
          <Link
            onClick={event => {
              event.preventDefault();
              toggleWarning(true);
            }}
          >
            Restore wallet or create a new one
          </Link>
        </PaddingStyled>
      </FormStyled>
    </>
  );
};

export default LoginActive;
