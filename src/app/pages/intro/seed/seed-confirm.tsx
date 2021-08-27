import React, { useState, useMemo, useEffect } from 'react';

import { Button, Footer } from 'app/uikit';
import ArrowIcon from '@icons/icon-arrow.svg';

import SeedList from './seed-list';

const SEED_CONFIRM_COUNT = 6;

interface SeedInputProps {
  seed: string[];
  ids: number[];
  onSubmit: React.FormEventHandler;
}

const SeedConfirm: React.FC<SeedInputProps> = ({ seed, ids, onSubmit }) => {
  const [errors, setErrors] = useState(
    new Array(SEED_CONFIRM_COUNT).fill(null),
  );
  const valid = errors.every(value => value === false);

  const handleInput: React.ChangeEventHandler<HTMLInputElement> = event => {
    event.preventDefault();
    const { name, value } = event.target;
    const index = parseInt(name);
    const result = seed[index] !== value;
    const target = ids.indexOf(index);

    if (errors[target] !== result) {
      const next = errors.slice();
      next[target] = result;
      setErrors(next);
    }
  };

  return (
    <form autoComplete="off" onSubmit={onSubmit}>
      <SeedList indexByValue data={ids} errors={errors} onInput={handleInput} />
      <Footer>
        <Button type="submit" disabled={!valid} icon={ArrowIcon}>
          next
        </Button>
      </Footer>
    </form>
  );
};

export default SeedConfirm;
