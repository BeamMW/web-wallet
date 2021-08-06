import React, { useState, useRef, useEffect } from 'react';

import { setSeed, setView, View } from '@model';

import { SeedRestore } from '@intro/seed';

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

  return (
    <div>
      <h1>Restore</h1>
      <SeedRestore onSubmit={handleSubmit} />
    </div>
  );
};

export default Restore;
