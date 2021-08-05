import React, { useState, useRef, useEffect } from 'react';

import WasmWallet from '@wallet';

import { setSeed, setView, View } from '@root';

const Login = () => {
  const wallet = WasmWallet.getInstance();
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>();

  const handleSubmit: React.FormEventHandler = async event => {
    event.preventDefault();
    const { value } = inputRef.current;
    try {
      await wallet.checkPassword(value);
      wallet.open(value);
      setError(false);
      setView(View.PROGRESS);
    } catch {
      setError(true);
    }
  };

  const handleRestoreClick: React.MouseEventHandler = () => {
    setView(View.RESTORE);
  };

  const handleCreateClick: React.MouseEventHandler = () => {
    const seed = wallet.getSeedPhrase().split(' ');
    setSeed(seed);
    setView(View.CREATE);
  };

  return (
    <div>
      <form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <input
          autoFocus
          name="password"
          type="password"
          placeholder="Password"
          ref={inputRef}
        />
        {error && 'fuck you!'}
        <button type="submit">Open your wallet</button>
        <button type="button" onClick={handleRestoreClick}>
          Restore
        </button>
        <button type="button" onClick={handleCreateClick}>
          Create
        </button>
      </form>
    </div>
  );
};

export default Login;
