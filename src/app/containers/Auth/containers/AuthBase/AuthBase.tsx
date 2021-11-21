import React, { useEffect, useState } from 'react';
import { useStore } from 'effector-react';

import { Popup, Splash, Button } from '@app/shared/components';
import { ROUTES } from '@app/shared/constants';

import { AddIcon, DoneIcon } from '@app/shared/icons';

import { useNavigate } from 'react-router-dom';
import { $phase, LoginPhase } from '../../old-store/login-model';
import { resetCache, resetErrors } from '../../old-store/seed-model';

// todo fix does not called
const AuthBase: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    resetCache();
    resetErrors();
  }, []);

  const [warningVisible, toggleWarning] = useState(false);
  // todo fix
  const phase = useStore($phase);
  const active = phase === LoginPhase.RESTORE;

  const handleReturn = () => {
    navigate(ROUTES.AUTH.LOGIN);
  };

  return (
    <>
      <Splash blur={warningVisible} onReturn={active ? handleReturn : null}>
        <Button type="button" icon={AddIcon} onClick={() => navigate(ROUTES.AUTH.REGISTRATION)}>
          create new wallet
        </Button>
        <Button variant="link" onClick={() => toggleWarning(true)}>
          Restore wallet
        </Button>
      </Splash>
      <Popup
        visible={warningVisible}
        title="Restore wallet"
        confirmButton={(
          <Button icon={DoneIcon} onClick={() => navigate(ROUTES.AUTH.RESTORE)}>
            I agree
          </Button>
        )}
        onCancel={() => toggleWarning(false)}
      >
        You are trying to restore an existing Beam Wallet.
        <br />
        Please notice that if you use your wallet on another device, your balance will be up to date, but transaction
        history and addresses will be kept separately on each device.
      </Popup>
    </>
  );
};

export default AuthBase;
