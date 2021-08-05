import React, { useState, useRef, useEffect } from 'react';
import { useStore } from 'effector-react';

import { createChangeHandler } from '@shared/utils';

import { $seed, setView, View } from '@root';
import WasmWallet from '@wallet';

const SetPassword = () => {
  const wallet = WasmWallet.getInstance();
  const seed = useStore($seed);
  const [pass, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const valid = pass !== '' && pass === confirm;

  const handleChangePassword = createChangeHandler(setPassword);
  const handleChangeConfirm = createChangeHandler(setConfirm);

  const handleSubmit: React.FormEventHandler = event => {
    event.preventDefault();
    wallet.create(seed.join(' '), pass, true);
    setView(View.PROGRESS);
  };

  return (
    <div>
      <h1>Set Password</h1>
      <form onSubmit={handleSubmit}>
        <input type="password" onChange={handleChangePassword} />
        <input type="password" onChange={handleChangeConfirm} />
        <button type="submit" disabled={!valid}>
          Submit
        </button>
      </form>
    </div>
  );
};

export default SetPassword;
