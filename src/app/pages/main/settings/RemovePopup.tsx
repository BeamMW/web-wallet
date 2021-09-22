/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useState } from 'react';
import { useStore } from 'effector-react';
import { styled } from '@linaria/react';

import {
  Input,
  Popup,
} from '@app/uikit';
import { deleteWalletFx } from './model';

interface RemovePopupProps {
  visible?: boolean;
  onCancel?: React.MouseEventHandler;
}

const TEXT_WARNING = `
All data will be erased.
Make sure you’ve saved your seed phrase if you want to restore this wallet later on!
Are you sure you want to remove your wallet?
`;

const RemovePopup = ({
  visible,
  onCancel,
}) => {
  const inputRef = useRef<HTMLInputElement>();
  const [warned, setWarned] = useState(false);
  const title = 'Remove current wallet';

  const handleConfirm: React.MouseEventHandler = () => {
    if (warned) {
      const { value } = inputRef.current;
      deleteWalletFx(value);
    } else {
      setWarned(true);
    }
  };

  return (
    <Popup visible={visible} title={title} onCancel={onCancel} onConfirm={handleConfirm}>
      { warned ? (
        <Input label="Password" type="password" ref={inputRef} />
      ) : TEXT_WARNING }
    </Popup>
  );
};

export default RemovePopup;
