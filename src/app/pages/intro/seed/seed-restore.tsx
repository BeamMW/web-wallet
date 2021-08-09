import React, { useState, useRef, useEffect } from 'react';

import WasmWallet from '@wallet';

const SEED_PHRASE_COUNT = 12;

interface SeedInputProps {
  onCancel: React.MouseEventHandler;
  onSubmit: React.FormEventHandler;
}

const SeedRestore: React.FC<SeedInputProps> = ({ onCancel, onSubmit }) => {
  const wallet = WasmWallet.getInstance();

  const [errors, setErrors] = useState(new Array(SEED_PHRASE_COUNT).fill(null));
  const valid = errors.every(value => value === false);

  const handleInput: React.ChangeEventHandler<HTMLInputElement> = event => {
    event.preventDefault();
    const { name, value } = event.target;
    const index = parseInt(name);
    const result = !wallet.isAllowedWord(value);
    if (errors[index] !== result) {
      const next = errors.slice();
      next[index] = result;

      setErrors(next);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <ul>
        {errors.map((value, index) => (
          <li key={index}>
            <input type="text" onInput={handleInput} name={index.toString()} />
          </li>
        ))}
      </ul>
      <button type="button" onClick={onCancel}>
        back
      </button>
      <button type="submit" disabled={!valid}>
        Submit
      </button>
    </form>
  );
};

export default SeedRestore;
