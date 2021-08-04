import React, { useState, useRef, useEffect } from 'react';

import WasmWallet from '@wallet';

import { setSeed, setView, View } from '@root';

const SEED_PHRASE_COUNT = 12;

const Restore = () => {
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

  const handleSubmit: React.ChangeEventHandler<HTMLFormElement> = event => {
    event.preventDefault();
    const data = new FormData(event.target);
    const seed = [];
    let i = 0;
    data.forEach(value => {
      seed[i] = value;
      i++;
    });
    setSeed(seed);
    setView(View.SET_PASSWORD);
  };

  return (
    <div>
      <h1>Restore</h1>
      <form onSubmit={handleSubmit}>
        <ol>
          {errors.map((value, index) => (
            <li key={index}>
              <input
                type="text"
                onInput={handleInput}
                name={index.toString()}
              />
            </li>
          ))}
        </ol>
        <button type="submit" disabled={!valid}>
          Submit
        </button>
      </form>
    </div>
  );
};

export default Restore;
