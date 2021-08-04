import React, { useState, useRef, useEffect } from 'react';
import { useStore } from 'effector-react';

import { createChangeHandler } from '@utils';

import { $seed, setView, View } from '@root';
import WasmWallet from '@wallet';

const SetPassword = () => {
  const [pass, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleChangePassword = createChangeHandler(setPassword);
  const handleChangeConfirm = createChangeHandler(setConfirm);

  const seed = useStore($seed);

  const handleSubmit: React.FormEventHandler = event => {
    event.preventDefault();
    const wallet = WasmWallet.getInstance();
    wallet.create(seed.join(' '), pass, true);
    setView(View.PROGRESS);
  };

  return (
    <div>
      <h1>Set Password</h1>
      <form onSubmit={handleSubmit}>
        <input type="password" onChange={handleChangePassword} />
        <input type="password" onChange={handleChangeConfirm} />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default SetPassword;
