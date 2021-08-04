import React, { useState, useRef, useEffect } from 'react';
import * as passworder from 'browser-passworder';

import { setView, View } from '@root';

const Login = () => {
  const [pass, setPass] = useState('');
  const inputRef = useRef<HTMLInputElement>();

  const handleSubmit: React.FormEventHandler = event => {
    event.preventDefault();
    const { value } = inputRef.current;
    console.log(value);
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
