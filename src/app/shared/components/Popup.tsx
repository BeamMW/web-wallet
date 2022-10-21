import React from 'react';
import { styled } from '@linaria/react';

import config from '@app/config';
import { CancelIcon } from '@app/shared/icons';

import Backdrop from './Backdrop';
import Button from './Button';

interface PopupProps {
  title?: string;
  cancelButton?: React.ReactElement;
  confirmButton?: React.ReactElement;
  visible?: boolean;
  onCancel?: React.MouseEventHandler;
  footerClass?: string;
}

const ContainerStyled = styled.div`
  transform: translateX(-50%) translateY(-50%);
  position: absolute;
  top: 50%;
  left: 50%;
  width: 335px;
  padding: 30px 20px;
  border-radius: 10px;
  background-color: ${`var(--color-popup-${config.theme})`};
  text-align: center;
  color: white;

  > .cancel-header {
    right: 4px;
    top: 10px;
    position: absolute;
  }
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
  &.justify-right {
    justify-content: right;
    margin-top: 40px;
  }
  &.qr-code-popup {
    > button {
      margin: 0 auto !important;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
`;

const Popup: React.FC<PopupProps> = ({
  title,
  visible,
  onCancel,
  cancelButton = (
    <Button variant="ghost" icon={CancelIcon} onClick={onCancel}>
      cancel
    </Button>
  ),
  confirmButton,
  children,
  footerClass,
}) =>
  visible ? (
    <Backdrop onCancel={onCancel}>
      <ContainerStyled>
        <TitleStyled>{title}</TitleStyled>
        <Button className="cancel-header" variant="icon" pallete="white" icon={CancelIcon} onClick={onCancel} />
        {children}
        <FooterStyled className={footerClass}>
          {cancelButton}
          {confirmButton}
        </FooterStyled>
      </ContainerStyled>
    </Backdrop>
  ) : null;

export default Popup;
