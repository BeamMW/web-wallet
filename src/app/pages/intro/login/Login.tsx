import React from 'react';
import { useStore } from 'effector-react';

import LoginActive from './LoginActive';
import LoginRestore from './LoginRestore';
import { $phase, LoginPhase } from './model';

const LoginLoading: React.FC = () => <div>Loading</div>;

function getLoginComponent(phase: LoginPhase) {
  switch (phase) {
    case LoginPhase.ACTIVE:
      return LoginActive;
    case LoginPhase.RESTORE:
    case LoginPhase.FIRSTTIME:
      return LoginRestore;
    default:
      return LoginLoading;
  }
}

const Login: React.FC = () => {
  const phase = useStore($phase);
  const Component = getLoginComponent(phase);
  return <Component />;
};

export default Login;
