import React, { useState } from 'react';

import { Button, Footer, Window } from '@app/shared/components';
import { ArrowRightIcon } from '@app/shared/icons';

import { $ids, $words, generateSeedFx } from '@model/base';
import { useStore } from 'effector-react';

import { ROUTES } from '@app/shared/constants';
import { useNavigate } from 'react-router-dom';
import { SeedList } from '@app/containers/Auth/components';

const SEED_CONFIRM_COUNT = 6;

const RegistrationConfirm: React.FC = () => {
  const seed = useStore($words);
  const ids = useStore($ids);
  const navigate = useNavigate();

  const [errors, setErrors] = useState(new Array(SEED_CONFIRM_COUNT).fill(null));
  const valid = errors.every((value) => value === true);

  const handleInput: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    event.preventDefault();
    const { name, value } = event.target;
    const index = parseInt(name, 10);
    const result = seed[index] === value;
    const target = ids.indexOf(index);

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
    generateSeedFx();
    navigate(ROUTES.AUTH.REGISTRATION);
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
