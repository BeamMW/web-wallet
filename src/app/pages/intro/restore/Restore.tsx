import React from 'react';

import { View, setView } from '@app/model/view';
import { setSeed } from '@app/model/base';

import { Window } from 'app/uikit';
import { SeedRestore } from '@pages/intro/seed';

const Restore = () => {
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
    <Window title="Restore wallet" onBackClick={() => setView(View.LOGIN)}>
      <p>Type in your seed phrase</p>
      <SeedRestore onSubmit={handleSubmit} />
    </Window>
  );
};

export default Restore;
