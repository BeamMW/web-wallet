import React, { useState } from 'react';

import { Button, Footer, Window } from 'app/uikit';
import ArrowRightIcon from '@icons/icon-arrow-right.svg';

import { $ids, $seed } from '@app/model/base';
import { useStore } from 'effector-react';
import { setView, View } from '@app/model/view';
import { SeedList } from '@pages/intro/seed';

const SEED_CONFIRM_COUNT = 6;

const SeedConfirm: React.FC = () => {
  const seed = useStore($seed);
  const ids = useStore($ids);

  const [errors, setErrors] = useState(
    new Array(SEED_CONFIRM_COUNT).fill(null),
  );
  const valid = errors.every((value) => value === false);

  const handleInput: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    event.preventDefault();
    const { name, value } = event.target;
    const index = parseInt(name, 10);
    const result = seed[index] !== value;
    const target = ids.indexOf(index);

    if (errors[target] !== result) {
      const next = errors.slice();
      next[target] = result;
      setErrors(next);
    }
  };

  const handleSubmit: React.FormEventHandler = (event) => {
    event.preventDefault();
    setView(View.SET_PASSWORD);
  };

  return (
    <Window title="Confirm seed phrase">
      <p>
        Your seed phrase is the access key to all the funds in your wallet.
        Print or write down the phrase to keep it in a safe or in a locked
        vault. Without the phrase you will not be able to recover your
        money.
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

export default SeedConfirm;
