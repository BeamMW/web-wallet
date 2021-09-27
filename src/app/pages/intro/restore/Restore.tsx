import React from 'react';

import { View, setView } from '@app/model/view';
import { setSeed } from '@app/model/base';

import { Button, Footer, Window } from 'app/uikit';
import SeedList from '@pages/intro/seed';
import { $errors, $valid, onInput } from '@pages/intro/seed/model';
import { useStore } from 'effector-react';

const Restore = () => {
  const errors = useStore($errors);
  const valid = useStore($valid);

  const handleSubmit: React.ChangeEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const seed = [];
    let i = 0;
    data.forEach((value) => {
      seed[i] = value;
      i += 1;
    });
    setSeed(seed);
    setView(View.SET_PASSWORD);
  };

  return (
    <Window title="Restore wallet">
      <p>Type in your seed phrase</p>
      <form autoComplete="off" onSubmit={handleSubmit}>
        <SeedList data={errors} onInput={onInput} />
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
