/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState } from 'react';

import {
  Button,
  Input,
  Popup,
} from '@app/uikit';

import {
  CancelIcon,
  ArrowRightIcon,
  RemoveIcon,
} from '@app/icons';

import { useStore } from 'effector-react';
import { isNil } from '@app/core/utils';
import {
  $error, deleteWalletFx, onInput, resetError,
} from './model';

interface RemovePopupProps {
  visible?: boolean;
  onCancel?: React.MouseEventHandler;
}

const RemovePopup: React.FC<RemovePopupProps> = ({
  visible,
  onCancel,
}) => {
  const inputRef = useRef<HTMLInputElement>();
  const [warned, setWarned] = useState(false);
  const error = useStore($error);

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
    : <Button pallete="red" icon={ArrowRightIcon} onClick={handleConfirm}>proceed</Button>;

  return (
    <Popup
      visible={visible}
      title="Remove current wallet"
      cancelButton={
        <Button variant="ghost" icon={CancelIcon} onClick={onCancel}>cancel</Button>
      }
      confirmButton={confirmButton}
      onCancel={onCancel}
    >
      { warned ? (
        <Input
          label={isNil(error) ? 'Password' : error}
          type="password"
          ref={inputRef}
          valid={isNil(error)}
          onInput={onInput}
        />
      ) : (
        <>
          All data will be erased.
          Make sure you’ve saved your seed phrase if you want to restore this wallet later on!
          <br />
          Are you sure you want to remove your wallet?
        </>
      ) }
    </Popup>
  );
};

export default RemovePopup;
