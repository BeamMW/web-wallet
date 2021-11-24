import React from 'react';
import { useStore } from 'effector-react';

import { setSeed } from '@app/model/base';
import { Button, Footer, Window } from '@app/uikit';
import SeedList from '@pages/intro/seed';

import {
  $cache,
  $errors,
  $valid,
  setCache,
  onInput,
} from '@pages/intro/seed/model';

import {history} from "@app/shared/history";
import {ROUTES} from "@app/shared/constants";
import {useNavigate} from "react-router-dom";

const Restore: React.FC = () => {
  const errors = useStore($errors);
  const cache = useStore($cache);
  const valid = useStore($valid);
  const navigate = useNavigate();

  const handleSubmit: React.ChangeEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const values = data.values() as IterableIterator<string>;

    const seed = Array.from(values).reduce(
      (result, value, index) => (index === 0 ? value : `${result} ${value}`),
    );

    setSeed([seed, true]);
    setCache(seed);
    navigate(ROUTES.AUTH.SET_PASSWORD);
  };

  return (
    <Window title="Restore wallet">
      <p>Type in your seed phrase</p>
      <form autoComplete="off" onSubmit={handleSubmit}>
        <SeedList
          data={errors}
          initial={cache}
          onInput={onInput}
        />
        <Footer>
          <Button type="submit" disabled={!valid}>
            Submit
          </Button>
        </Footer>
      </form>
    </Window>
  );
};

export default Restore;
