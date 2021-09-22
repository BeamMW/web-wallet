import React from 'react';
import { useStore } from 'effector-react';

import LoginActive from './LoginActive';
import LoginRestore from './LoginRestore';
import { $phase, LoginPhase } from './model';

function getLoginComponent(phase: LoginPhase) {
  switch (phase) {
    case LoginPhase.RESTORE:
    case LoginPhase.FIRSTTIME:
      return LoginRestore;
    default:
      return LoginActive;
  }
}

const Login: React.FC = () => {
  const phase = useStore($phase);
  const Component = getLoginComponent(phase);
  return <Component />;
};

export default Login;
