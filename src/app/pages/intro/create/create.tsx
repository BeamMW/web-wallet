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
import LockIcon from '@icons/icon-lock.svg';
import ArrowIcon from '@icons/icon-arrow.svg';

const SEED_CONFIRM_COUNT = 6;

const WarningListStyled = styled.ul`
  list-style: none;
  margin-bottom: 30px;

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

const SeedListStyled = styled.ol`
  counter-reset: counter;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 20px;
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
        <Window title="Seed phrase" onBackClick={handleBackClick}>
          <p>
            Your seed phrase is the access key to all the funds in your wallet.
            Print or write down the phrase to keep it in a safe or in a locked
            vault. Without the phrase you will not be able to recover your
            money.
          </p>
          <SeedListStyled>
            {seed.map((value, index) => (
              <li key={index}>{value}</li>
            ))}
          </SeedListStyled>
          <Button icon={LockIcon} type="button" onClick={handleNextClick}>
            Complete verification
          </Button>
          <Button
            icon={ArrowIcon}
            type="button"
            color="ghost"
            onClick={handleSkipClick}
          >
            I will do it later
          </Button>
        </Window>
      );
    case 2: // confirm seed phrase
      return (
        <Window title="Confirm seed phrase" onBackClick={handleBackClick}>
          <p>
            Your seed phrase is the access key to all the funds in your wallet.
            Print or write down the phrase to keep it in a safe or in a locked
            vault. Without the phrase you will not be able to recover your
            money.
          </p>
          <SeedConfirm seed={seed} ids={ids} onSubmit={handleSubmit} />
        </Window>
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
          <WarningListStyled>
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
          </WarningListStyled>
          <Button icon={DoneIcon} type="button" onClick={handleNextClick}>
            I understand
          </Button>
        </Window>
      );
  }
};

export default Create;
