/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useState } from 'react';

import {
  Button,
  Input,
  Popup,
} from '@app/uikit';

import CancelIcon from '@icons/icon-cancel.svg';
import ArrowRightIcon from '@icons/icon-arrow-right.svg';
import RemoveIcon from '@icons/icon-remove.svg';

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

const RemovePopup: React.FC<RemovePopupProps> = ({
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

  const confirmButton = warned
    ? <Button pallete="red" icon={RemoveIcon} onClick={handleConfirm}>remove</Button>
    : <Button pallete="red" icon={ArrowRightIcon} onClick={handleConfirm}>next</Button>;

  return (
    <Popup
      visible={visible}
      title={title}
      cancelButton={
        <Button variant="ghost" icon={CancelIcon} onClick={onCancel}>cancel</Button>
      }
      confirmButton={confirmButton}
      onCancel={onCancel}
    >
      { warned ? (
        <Input label="Password" type="password" ref={inputRef} />
      ) : TEXT_WARNING }
    </Popup>
  );
};

export default RemovePopup;
