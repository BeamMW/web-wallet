import React from 'react';
import { styled } from '@linaria/react';

import { isNil } from '@core/utils';

interface PopupProps {
  title?: string;
  cancel?: string;
  confirm?: string;
  onCancel?: React.MouseEventHandler;
  onConfirm?: React.MouseEventHandler;
}

const Backdrop = styled.div`
  position: fixed;
  z-index: 1;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
`;

const Container = styled.div`
  transform: translateX(-50%) translateY(-50%);
  position: absolute;
  top: 50%;
  left: 50%;
  padding: 20px;
  background-color: gray;
  text-align: center;
  color: white;
`;

const Popup: React.FC<PopupProps> = ({
  title,
  cancel,
  confirm,
  onCancel,
  onConfirm,
  children,
}) => (
  <Backdrop>
    <Container>
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
    </Container>
  </Backdrop>
);

export default Popup;
