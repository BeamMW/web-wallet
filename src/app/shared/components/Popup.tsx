import React from 'react';
import { styled } from '@linaria/react';

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
  children?: React.ReactNode;
}

const ContainerStyled = styled.div`
  transform: translateX(-50%) translateY(-50%);
  position: absolute;
  top: 50%;
  left: 50%;
  width: 336px;
  max-width: calc(100vw - 28px);
  padding: 26px 20px;
  clip-path: var(--cp-clip);
  border: 1px solid var(--cp-line-2);
  background-color: var(--cp-panel);
  box-shadow: 0 24px 60px -18px rgba(0, 0, 0, 0.85), 0 0 40px -18px rgba(218, 104, 245, 0.3);
  text-align: center;
  color: var(--cp-text);

  > .cancel-header {
    right: 4px;
    top: 10px;
    position: absolute;
  }
`;

const TitleStyled = styled.h2`
  font-family: var(--font-mono);
  font-size: 14px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  margin: 0 0 20px;
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
}) => (visible ? (
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
) : null);

export default Popup;
