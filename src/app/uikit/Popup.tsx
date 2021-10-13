import React from 'react';
import { styled } from '@linaria/react';

import { CancelIcon } from '@app/icons';

import Backdrop from './Backdrop';
import Button from './Button';

interface PopupProps {
  title?: string;
  cancelButton?: React.ReactElement;
  confirmButton?: React.ReactElement;
  visible?: boolean;
  onCancel?: React.MouseEventHandler;
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
    margin: 0 7px !important;
  }
`;

const Popup: React.FC<PopupProps> = ({
  title,
  visible,
  onCancel,
  cancelButton = (
    <Button
      variant="ghost"
      icon={CancelIcon}
      onClick={onCancel}
    >
      cancel
    </Button>
  ),
  confirmButton,
  children,
}) => (visible ? (
  <Backdrop onCancel={onCancel}>
    <ContainerStyled>
      <TitleStyled>{title}</TitleStyled>
      {children}
      <FooterStyled>
        {cancelButton}
        {confirmButton}
      </FooterStyled>
    </ContainerStyled>
  </Backdrop>
) : null);

export default Popup;
