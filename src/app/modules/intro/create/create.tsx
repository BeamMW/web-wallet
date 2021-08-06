import React, { useMemo, useState } from 'react';

import { SeedConfirm } from '@intro/seed';
import { $seed, setView, View } from '@model';
import { useStore } from 'effector-react';

const SEED_CONFIRM_COUNT = 6;

const getRandomIds = () => {
  const result = [];
  while (result.length < SEED_CONFIRM_COUNT) {
    const value = Math.floor(Math.random() * 12);
    if (result.includes(value)) {
      continue;
    }
    result.push(value);
  }
  return result;
};

const Create = () => {
  const [step, setStep] = useState(0);
  const seed = useStore($seed);
  const ids = useMemo(getRandomIds, seed);

  const handleSubmit: React.FormEventHandler = event => {
    event.preventDefault();
    setView(View.SET_PASSWORD);
  };

  const handleClickNext: React.MouseEventHandler = () => {
    setStep(step + 1);
  };

  switch (step) {
    case 1:
      return (
        <div>
          <h1>Seed Phrase</h1>
          <ul>
            {seed.map((value, index) => (
              <li key={index}>{value}</li>
            ))}
          </ul>
          <button type="button" onClick={handleClickNext}>
            Next
          </button>
        </div>
      );
    case 2:
      return (
        <div>
          <h1>Confirm Seed Phrase</h1>
          <SeedConfirm seed={seed} ids={ids} onSubmit={handleSubmit} />
        </div>
      );
    default:
      return (
        <div>
          <h1>Seed Phrase</h1>
          <p>This is a warning!</p>
          <button type="button" onClick={handleClickNext}>
            I see!
          </button>
        </div>
      );
  }
};

export default Create;
