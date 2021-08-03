import React, { useEffect } from 'react';

import WasmWallet from './WasmWallet';

const App = () => {
  useEffect(() => {
    WasmWallet.getInstance().init();
  }, []);

  return <div>Hello World!</div>;
};

export default App;
