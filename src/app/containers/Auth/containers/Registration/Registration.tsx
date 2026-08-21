import React, { useEffect, useState } from 'react';
import { styled } from '@linaria/react';

import {
  Window, Popup, Button, Footer,
} from '@app/shared/components';

import { ROUTES } from '@app/shared/constants';

import { DoneIcon, LockIcon } from '@app/shared/icons';

import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { generateRegistrationSeed } from '@app/containers/Auth/store/actions';
import { selectRegistrationSeed } from '@app/containers/Auth/store/selectors';
import { unsetAssetSync } from '@app/shared/store/actions';
import { RegistrationWarning } from '../../components';

const SeedListStyled = styled.ol`
  counter-reset: counter;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 6px 8px;
  padding: 0;

  > li {
    counter-increment: counter;
    display: inline-flex;
    align-items: center;
    width: calc(50% - 4px);
    height: 36px;
    margin-bottom: 4px;
    border: 1px solid var(--cp-line);
    clip-path: var(--cp-clip-sm);
    background: rgba(0, 0, 0, 0.25);
    text-align: left;
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--cp-text);

    &:before {
      display: inline-block;
      content: counter(counter);
      width: 20px;
      height: 20px;
      line-height: 20px;
      margin: 0 10px 0 9px;
      border-radius: 50%;
      background-color: rgba(0, 246, 210, 0.15);
      text-align: center;
      font-size: 10px;
      color: var(--cp-accent);
      flex-shrink: 0;
    }
  }
`;

const Registration: React.FC = () => {
  const location = useLocation();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const seed = useSelector(selectRegistrationSeed());
  const [isRegistrationWarning, setRegistrationWarning] = useState(!location.search);
  const [warningVisible, toggleWarning] = useState(false);

  // const handleSkipClick: React.MouseEventHandler = () => {
  //   navigate(ROUTES.AUTH.SET_PASSWORD);
  // };

  useEffect(() => {
    dispatch(generateRegistrationSeed.request());
  }, [dispatch]);

  const handleNextClick: React.MouseEventHandler = () => {
    navigate(ROUTES.AUTH.REGISTRATION_CONFIRM);
    dispatch(unsetAssetSync());
  };

  const handleCancel: React.MouseEventHandler = () => {
    toggleWarning(false);
  };

  const handlePrevious: React.MouseEventHandler = () => {
    navigate(ROUTES.AUTH.BASE);
  };

  return !isRegistrationWarning ? (
    <>
      <Window title="Seed phrase" onPrevious={handlePrevious}>
        <p>
          Your seed phrase is the access key to all the funds in your wallet. Print or write down the phrase to keep it
          in a safe or in a locked vault. Without the phrase you will not be able to recover your money.
        </p>
        <SeedListStyled>
          {seed.split(' ').map((value, index) => (
            // eslint-disable-next-line
            <li key={index}>{value}</li>
          ))}
        </SeedListStyled>
        <Footer margin="small">
          <Button icon={LockIcon} type="button" onClick={() => toggleWarning(true)}>
            Complete verification
          </Button>
        </Footer>
      </Window>
      <Popup
        visible={warningVisible}
        title="Save seed phrase"
        confirmButton={(
          <Button icon={DoneIcon} onClick={handleNextClick}>
            done
          </Button>
        )}
        onCancel={handleCancel}
      >
        Please write the seed phrase down. Storing it in a file makes it prone to cyber attacks and, therefore, less
        secure.
      </Popup>
    </>
  ) : (
    <RegistrationWarning onClick={() => setRegistrationWarning(false)} />
  );
};

export default Registration;
