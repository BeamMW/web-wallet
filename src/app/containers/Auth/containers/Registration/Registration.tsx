import React, { useEffect, useState } from 'react';
import { styled } from '@linaria/react';

import {
  Window, Popup, Button, Footer,
} from '@app/shared/components';

import { ROUTES } from '@app/shared/constants';

import { DoneIcon, LockIcon } from '@app/shared/icons';

import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { generateRegistrationSeed } from '@app/containers/Auth/store/actions';
import { selectRegistrationSeed } from '@app/containers/Auth/store/selectors';
import { RegistrationWarning } from '../../components';

const SeedListStyled = styled.ol`
  counter-reset: counter;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 0 10px;

  > li {
    counter-increment: counter;
    display: inline-block;
    width: 140px;
    height: 32px;
    line-height: 30px;
    margin-bottom: 10px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    text-align: left;

    &:before {
      display: inline-block;
      content: counter(counter);
      width: 20px;
      height: 20px;
      line-height: 20px;
      margin: 5px 10px 5px 9px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.2);
      text-align: center;
      font-size: 10px;
      color: rgba(255, 255, 255, 0.5);
    }
`;

const Registration: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const seed = useSelector(selectRegistrationSeed());
  const [isRegistrationWarning, setRegistrationWarning] = useState(!!seed);
  const [warningVisible, toggleWarning] = useState(false);

  // const handleSkipClick: React.MouseEventHandler = () => {
  //   navigate(ROUTES.AUTH.SET_PASSWORD);
  // };

  useEffect(() => {
    if (!seed) {
      dispatch(generateRegistrationSeed.request());
    }
  }, [seed, dispatch]);

  const handleNextClick: React.MouseEventHandler = () => {
    navigate(ROUTES.AUTH.REGISTRATION_CONFIRM);
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
