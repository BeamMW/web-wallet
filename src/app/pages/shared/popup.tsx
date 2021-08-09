import { isNil } from '@app/utils';
import React from 'react';

interface PopupProps {
  title?: string;
  cancel?: string;
  confirm?: string;
  onCancel?: React.MouseEventHandler;
  onConfirm?: React.MouseEventHandler;
}

const Popup: React.FC<PopupProps> = ({
  title,
  cancel,
  confirm,
  onCancel,
  onConfirm,
  children,
}) => (
  <div>
    <h2>{title}</h2>
    {children}
    {!isNil(cancel) && (
      <button type="button" onClick={onCancel}>
        {cancel}
      </button>
    )}
    <button type="button" onClick={onConfirm}>
      {confirm}
    </button>
  </div>
);

export default Popup;
