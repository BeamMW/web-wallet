import React, { useState } from 'react';
import { styled } from '@linaria/react';

import {
  Window, Button, Input, Footer, Popup,
} from '@app/shared/components';

import { ArrowLeftIcon, ArrowRightIcon } from '@app/shared/icons';

import { createWallet } from '@core/api';

import { ROUTES } from '@app/shared/constants';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectRegistrationSeed, selectIsRestore } from '@app/containers/Auth/store/selectors';
import { PasswordStrength } from '../../components';

const FormStyled = styled.form`
  text-align: left;

  .input {
    margin: 0.5rem 0 0.3rem;
  }

  h3 {
    font-size: 14px;
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: normal;
    text-align: center;
    color: #fff;
    text-align: center;
    margin: 0 auto 30px;
  }

  span {
    font-size: 14px;
    font-weight: bold;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: normal;
    color: #fff;
    margin: 0.5rem 0;
  }
  > ul {
    margin-bottom: 30px;
    padding-left: 20px;
    list-style-type: circle;

    li {
      color: rgba(255, 255, 255, 0.5);
    }
  }
  p {
    margin: 0;
    color: rgba(255, 255, 255, 0.5);
  }
`;

const SetPassword = () => {
  const [pass, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [warningVisible, toggleWarning] = useState(false);
  const seed = useSelector(selectRegistrationSeed());
  const restoring = useSelector(selectIsRestore());

  const navigate = useNavigate();

  const matched = pass === confirm;
  const valid = confirm === '' || matched;
  const ready = pass !== '' && matched;

  const error = valid ? null : 'Passwords do not match';

  const handleSubmit: React.FormEventHandler = (event) => {
    event.preventDefault();
    createWallet({
      seed,
      password: pass,
      isSeedConfirmed: true,
    });

    navigate(ROUTES.AUTH.PROGRESS);
  };

  const handlePrevious: React.MouseEventHandler = () => {
    if (restoring) {
      navigate(ROUTES.AUTH.RESTORE);
    } else {
      toggleWarning(true);
    }
  };

  const handleReturnClick: React.MouseEventHandler = () => {
    navigate(`${ROUTES.AUTH.REGISTRATION}?do_not_show_warn=true`);
  };

  return (
    <>
      <Window title="Password" onPrevious={handlePrevious}>
        <FormStyled onSubmit={handleSubmit}>
          <h3>Create new password to access your wallet</h3>
          <span>Password</span>
          <Input
            id="pwd"
            className="input"
            autoFocus
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <span>Confirm password</span>
          <Input
            id="confirm"
            className="input"
            type="password"
            valid={valid}
            label={error}
            placeholder="Confirm password"
            onChange={(e) => setConfirm(e.target.value)}
          />

          <PasswordStrength value={pass} />
          <p>Strong password needs to meet the following requirements:</p>
          <ul>
            <li>the length must be at least 10 characters</li>
            <li>must contain at least one lowercase letter</li>
            <li>must contain at least one uppercase letter</li>
            <li>must contain at least one number</li>
          </ul>
          <Footer>
            <Button type="submit" icon={ArrowRightIcon} disabled={!ready}>
              start using your wallet
            </Button>
          </Footer>
        </FormStyled>
      </Window>
      <Popup
        visible={warningVisible}
        title="Return to seed phrase"
        confirmButton={(
          <Button icon={ArrowLeftIcon} onClick={handleReturnClick}>
            return
          </Button>
        )}
        onCancel={() => toggleWarning(false)}
      >
        If you return to seed phrase, it would be changed and your local password won’t be saved.
      </Popup>
    </>
  );
};

export default SetPassword;
