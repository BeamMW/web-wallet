import React, { useState, useMemo, useEffect } from 'react';

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
    <form onSubmit={onSubmit}>
      <ul>
        {ids.map((value, index) => {
          return (
            <li key={index}>
              {value.toString()}
              <input
                type="text"
                onInput={handleInput}
                name={value.toString()}
              />
            </li>
          );
        })}
      </ul>
      <button type="submit" disabled={!valid}>
        Submit
      </button>
    </form>
  );
};

export default SeedConfirm;
