import React, { useState } from 'react';
import { styled } from '@linaria/react';

import {
  Window, Button, Input, Footer, Popup,
} from 'app/uikit';
import { View, setView } from '@app/model/view';
import { makeOnChange } from '@core/utils';
import ArrowRightIcon from '@icons/icon-arrow-right.svg';
import ArrowLeftIcon from '@icons/icon-arrow-left.svg';

import { createWallet } from '@app/core/api';
import { useStore } from 'effector-react';
import { $seed } from '@app/model/base';
import PasswordStrength from './PasswordStrength';

const FormStyled = styled.form`
  text-align: left;

  > ul {
    margin-bottom: 30px;
    padding-left: 20px;
  }
`;

const SetPassword = () => {
  const [pass, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [warningVisible, toggleWarning] = useState(false);
  const seed = useStore($seed);

  const matched = pass === confirm;
  const valid = confirm === '' || matched;
  const ready = pass !== '' && matched;

  const error = valid ? null : 'Passwords do not match';

  const onPasswordChange = makeOnChange(setPassword);
  const onConfirmChange = makeOnChange(setConfirm);

  const handleSubmit: React.FormEventHandler = (event) => {
    event.preventDefault();
    createWallet({
      seed: seed.join(' '),
      password: pass,
      isSeedConfirmed: true,
    });
    setView(View.PROGRESS);
  };

  const handlePrevious: React.MouseEventHandler = () => {
    toggleWarning(true);
  };

  const handleReturnClick: React.MouseEventHandler = () => {
    setView(View.SEED_WRITE);
  };

  return (
    <>
      <Window title="Password" onPrevious={handlePrevious}>
        <FormStyled onSubmit={handleSubmit}>
          <Input
            autoFocus
            type="password"
            placeholder="Password"
            onChange={onPasswordChange}
          />
          <PasswordStrength value={pass} />
          <p>Strong password needs to meet the following requirements:</p>
          <ul>
            <li>the length must be at least 10 characters</li>
            <li>must contain at least one lowercase letter</li>
            <li>must contain at least one uppercase letter</li>
            <li>must contain at least one number</li>
          </ul>
          <Input
            type="password"
            valid={valid}
            label={error}
            placeholder="Confirm password"
            onChange={onConfirmChange}
          />
          <Footer>
            <Button type="submit" icon={ArrowRightIcon} disabled={!ready}>
              next
            </Button>
          </Footer>
        </FormStyled>
      </Window>
      <Popup
        visible={warningVisible}
        title="Return to seed phrase"
        confirmButton={(
          <Button
            icon={ArrowLeftIcon}
            onClick={handleReturnClick}
          >
            return
          </Button>
            )}
        onCancel={() => toggleWarning(false)}
      >
        Please write the seed phrase down. Storing it in a file makes it
        prone to cyber attacks and, therefore, less secure.
      </Popup>
    </>
  );
};

export default SetPassword;
