import React from 'react';

import { setSeed } from '@state/intro';
import { View, setView } from '@state/shared';
import { SeedRestore } from '@pages/intro/seed';

const Restore = () => {
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

  const handleBackClick: React.MouseEventHandler = () => {
    setView(View.LOGIN);
  };

  return (
    <div>
      <h1>Restore</h1>
      <SeedRestore onCancel={handleBackClick} onSubmit={handleSubmit} />
    </div>
  );
};

export default Restore;
