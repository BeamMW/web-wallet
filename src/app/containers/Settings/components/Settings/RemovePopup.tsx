/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useState } from 'react';

import { Button, Input, Popup } from '@app/shared/components';

import { CancelIcon, ArrowRightIcon, RemoveIcon } from '@app/shared/icons';

import { useDispatch, useSelector } from 'react-redux';
import { deleteWallet } from '@app/containers/Settings/store/actions';
import { selectErrorMessage } from '@app/shared/store/selectors';
import { setError } from '@app/shared/store/actions';

interface RemovePopupProps {
  visible?: boolean;
  onCancel?: React.MouseEventHandler;
}

const RemovePopup: React.FC<RemovePopupProps> = ({ visible, onCancel }) => {
  const inputRef = useRef<HTMLInputElement>();
  const [warned, setWarned] = useState(false);
  const dispatch = useDispatch();
  const error = useSelector(selectErrorMessage());

  const clearError = () => {
    dispatch(setError(null));
  };

  const handleConfirm: React.MouseEventHandler = () => {
    if (warned) {
      const { value } = inputRef.current;
      dispatch(deleteWallet.request(value));
    } else {
      setWarned(true);
    }
  };

  const confirmButton = warned ? (
    <Button pallete="red" icon={RemoveIcon} onClick={handleConfirm}>
      remove
    </Button>
  ) : (
    <Button pallete="red" icon={ArrowRightIcon} onClick={handleConfirm}>
      next
    </Button>
  );

  return (
    <Popup
      visible={visible}
      title="Remove current wallet"
      cancelButton={
        <Button variant="ghost" icon={CancelIcon} onClick={onCancel}>
          cancel
        </Button>
      }
      confirmButton={confirmButton}
      onCancel={onCancel}
    >
      {warned ? (
        <Input
          label={!error ? 'Password' : error}
          type="password"
          ref={inputRef}
          valid={!error}
          onChange={clearError}
        />
      ) : (
        <>
          All data will be erased. Make sure you’ve saved your seed phrase if you want to restore this wallet later on!
          <br />
          Are you sure you want to remove your wallet?
        </>
      )}
    </Popup>
  );
};

export default RemovePopup;
