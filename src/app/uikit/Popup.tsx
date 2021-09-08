import React from 'react';
import { styled } from '@linaria/react';

import { isNil } from '@core/utils';

import cancelIcon from '@icons/icon-cancel.svg';
import doneIcon from '@icons/icon-done.svg';

import Button from './Button';
import Backdrop from './Backdrop';

interface PopupProps {
  title?: string;
  cancel?: string;
  confirm?: string;
  visible?: boolean;
  onCancel?: React.MouseEventHandler;
  onConfirm?: React.MouseEventHandler;
}

const ContainerStyled = styled.div`
  transform: translateX(-50%) translateY(-50%);
  position: absolute;
  top: 50%;
  left: 50%;
  width: 335px;
  padding: 30px 20px;
  border-radius: 10px;
  background-color: var(--color-popup);
  text-align: center;
  color: white;
`;

const TitleStyled = styled.h2`
  font-size: 16px;
  margin: 0;
  margin-bottom: 20px;
`;

const FooterStyled = styled.div`
  display: flex;
  margin: 0 -7px;
  margin-top: 20px;

  > button {
    margin: 0 7px;
  }
`;

const Popup: React.FC<PopupProps> = ({
  title,
  cancel,
  confirm,
  visible,
  onCancel,
  onConfirm,
  children,
}) => (visible ? (
  <Backdrop onCancel={onCancel}>
    <ContainerStyled>
      <TitleStyled>{title}</TitleStyled>
      {children}
      <FooterStyled>
        {!isNil(cancel) && (
        <Button
          icon={cancelIcon}
          variant="ghost"
          type="button"
          onClick={onCancel}
        >
          {cancel}
        </Button>
        )}
        <Button icon={doneIcon} type="button" onClick={onConfirm}>
          {confirm}
        </Button>
      </FooterStyled>
    </ContainerStyled>
  </Backdrop>
) : null);

export default Popup;
