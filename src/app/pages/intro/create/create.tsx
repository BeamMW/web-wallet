import React, { useMemo, useState } from 'react';
import { useStore } from 'effector-react';
import { styled } from '@linaria/react';

import { Window, Button } from '@pages/shared';

import { SeedConfirm } from '@pages/intro/seed';
import { $seed } from '@state/intro';
import { View, setView, $onboarding } from '@state/shared';

import EyeIcon from '@icons/icon-eye.svg';
import PassIcon from '@icons/icon-pass.svg';
import CopyIcon from '@icons/icon-copy.svg';
import DoneIcon from '@icons/icon-done.svg';

const SEED_CONFIRM_COUNT = 6;

const ListStyled = styled.ul`
  list-style: none;
  margin: 0;
  margin-bottom: 30px;
  padding: 0;

  > li {
    position: relative;
    height: 34px;
    line-height: 34px;
    margin-bottom: 20px;
    padding-left: 60px;
    text-align: left;
  }

  svg {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
  }

  p {
    display: inline-block;
    vertical-align: middle;
    line-height: normal;
    margin: 0;
  }
`;

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
  const onboarding = useStore($onboarding);
  const ids = useMemo(getRandomIds, seed);

  const handleSubmit: React.FormEventHandler = event => {
    event.preventDefault();
    setView(View.SET_PASSWORD);
  };

  const handleBackClick: React.MouseEventHandler = event => {
    event.preventDefault();
    setView(View.LOGIN);
  };

  const handleSkipClick: React.MouseEventHandler = () => {
    setView(View.SET_PASSWORD);
  };

  const handleNextClick: React.MouseEventHandler = () => {
    setStep(step + 1);
  };

  switch (step) {
    case 1: // write seed phrase
      return (
        <div>
          <h1>Seed Phrase</h1>
          <ul>
            {seed.map((value, index) => (
              <li key={index}>{value}</li>
            ))}
          </ul>
          <button type="button" onClick={handleBackClick}>
            Back
          </button>
          <button type="button" onClick={handleSkipClick}>
            I will do it later
          </button>
          <button type="button" onClick={handleNextClick}>
            Next
          </button>
        </div>
      );
    case 2: // confirm seed phrase
      return (
        <div>
          <h1>Confirm Seed Phrase</h1>
          <SeedConfirm seed={seed} ids={ids} onSubmit={handleSubmit} />
        </div>
      );
    default:
      // warning
      return (
        <Window title="Create new wallet" onBackClick={handleBackClick}>
          <p>
            If you ever lose your device, you will need this phrase to recover
            your wallet!
            <br /> Never type your seed phrase in keychains or password
            managers.
            <br />
            Never save it in your local or remote folders in any form.
          </p>
          <ListStyled>
            <li>
              <EyeIcon width={48} height={34} />
              <p>Do not let anyone see your seed phrase</p>
            </li>
            <li>
              <PassIcon width={48} height={34} />
              <p>
                Never type your seed phrase into password managers or elsewhere
              </p>
            </li>
            <li>
              <CopyIcon width={48} height={34} />
              <p>Make at least 2 copies of the phrase in case of emergency</p>
            </li>
          </ListStyled>
          <Button icon={DoneIcon} type="button" onClick={handleNextClick}>
            I understand
          </Button>
        </Window>
      );
  }
};

export default Create;
