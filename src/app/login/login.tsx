import React, { useState, useRef, useEffect } from 'react';

import WasmWallet from '@wallet';

import { setView, View } from '@root';

const Login = () => {
  const wallet = WasmWallet.getInstance();
  const [erorr, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>();

  const handleSubmit: React.FormEventHandler = async event => {
    event.preventDefault();
    const { value } = inputRef.current;
    try {
      await wallet.checkPassword(value);
      setError(false);
      wallet.open(value);
      setView(View.PROGRESS);
    } catch {
      setError(true);
    }
  };

  const handleRestore: React.MouseEventHandler = event => {
    setView(View.RESTORE);
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
        <button type="submit">Open your wallet</button>
        <button type="button" onClick={handleRestore}>
          Restore wallet
        </button>
      </form>
    </div>
  );
};

export default Login;
