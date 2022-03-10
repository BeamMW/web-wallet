import React, { useState, useRef, useCallback } from 'react';

import {
  Popup, Button, Input, Splash,
} from '@app/shared/components';

import { WalletSmallIcon, DoneIcon } from '@app/shared/icons';

import { ROUTES } from '@app/shared/constants';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { startWallet } from '@app/containers/Auth/store/actions';
import { setError } from '@app/shared/store/actions';
import { selectErrorMessage } from '@app/shared/store/selectors';

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [warningVisible, toggleWarning] = useState(false);

  const error = useSelector(selectErrorMessage());

  const inputRef = useRef<HTMLInputElement>();

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      const { value } = inputRef.current;

      dispatch(setError(null));
      dispatch(startWallet.request(value));
    },
    [dispatch, inputRef?.current],
  );

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
            valid={!error}
            label={error}
            ref={inputRef}
          />
          <Button type="submit" icon={WalletSmallIcon}>
            open your wallet
          </Button>
          <Button
            variant="link"
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
          <Button icon={DoneIcon} onClick={() => navigate(ROUTES.AUTH.BASE)}>
            I agree
          </Button>
        )}
        onCancel={() => {
          toggleWarning(false);
        }}
      >
        If you&apos;ll restore a wallet all transaction history and addresses will be lost
      </Popup>
    </>
  );
};

export default Login;
