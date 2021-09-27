import React from 'react';
import { styled } from '@linaria/react';
import { isNil } from '@core/utils';

import { css } from '@linaria/core';
import Logo from './Logo';
import BackButton from './BackButton';

interface SplashProps {
  size?: 'large' | 'small';
  blur?: boolean;
  onReturn?: React.MouseEventHandler;
}

const ContainerStyled = styled.div<SplashProps>`
  filter: ${({ blur }) => (blur ? 'blur(3px)' : 'none')};
  position: relative;
  height: 600px;
  padding: 120px 30px 0;
  background-image: url('/assets/background.png');
  text-align: center;
`;

const TitleStyled = styled.div<SplashProps>`
  margin-bottom: ${({ size }) => (size === 'small' ? 50 : 100)}px;
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-blue);
`;

const backButtonStyle = css`
  top: 23px;
`;

export const Splash: React.FC<SplashProps> = ({
  size,
  blur,
  onReturn,
  children,
}) => (
  <ContainerStyled blur={blur}>
    {!isNil(onReturn) && <BackButton onClick={onReturn} className={backButtonStyle} />}
    <Logo size={size} />
    <TitleStyled size={size}>Scalable confidential cryptocurrency</TitleStyled>
    {children}
  </ContainerStyled>
);

export default Splash;
