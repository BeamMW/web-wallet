import React, { useState } from 'react';

import { Button, Footer, Window } from '@app/shared/components';
import { ArrowRightIcon } from '@app/shared/icons';

import { ROUTES } from '@app/shared/constants';
import { useNavigate } from 'react-router-dom';
import { SeedList } from '@app/containers/Auth/components';
import { useDispatch, useSelector } from 'react-redux';
import { selectSeedIds, selectRegistrationSeed } from '@app/containers/Auth/store/selectors';
import { generateRegistrationSeed } from '@app/containers/Auth/store/actions';

const SEED_CONFIRM_COUNT = 6;

const RegistrationConfirm: React.FC = () => {
  const dispatch = useDispatch();
  const seed = useSelector(selectRegistrationSeed()).split(' ');
  const ids = useSelector(selectSeedIds());
  const navigate = useNavigate();

  const [errors, setErrors] = useState(new Array(SEED_CONFIRM_COUNT).fill(null));
  const valid = errors.every((value) => value === true);

  const handleInput: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    event.preventDefault();
    const { name, value } = event.target;
    const index = parseInt(name, 10);
    const result = seed[index] === value;
    const target = ids.indexOf(index);

    if (!value) {
      const next = errors.slice();
      next[target] = null;
      setErrors(next);
      return;
    }

    if (errors[target] !== result) {
      const next = errors.slice();
      next[target] = result;
      setErrors(next);
    }
  };

  const handleSubmit: React.FormEventHandler = (event) => {
    event.preventDefault();
    navigate(ROUTES.AUTH.SET_PASSWORD);
  };

  const handlePrevious: React.MouseEventHandler = () => {
    dispatch(generateRegistrationSeed.request());
    navigate(`${ROUTES.AUTH.REGISTRATION}?do_not_show_warn=true`);
  };

  return (
    <Window title="Confirm seed phrase" onPrevious={handlePrevious}>
      <p>
        Your seed phrase is the access key to all the funds in your wallet. Print or write down the phrase to keep it in
        a safe or in a locked vault. Without the phrase you will not be able to recover your money.
      </p>
      <form autoComplete="off" onSubmit={handleSubmit}>
        <SeedList indexByValue data={ids} errors={errors} onInput={handleInput} />
        <Footer>
          <Button type="submit" disabled={!valid} icon={ArrowRightIcon}>
            next
          </Button>
        </Footer>
      </form>
    </Window>
  );
};

export default RegistrationConfirm;
