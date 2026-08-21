import React from 'react';
import { styled } from '@linaria/react';

import { css } from '@linaria/core';
import Logo from './Logo';
import BackButton from './BackButton';

interface SplashProps {
  size?: 'large' | 'small';
  blur?: boolean;
  onReturn?: React.MouseEventHandler;
  children?: React.ReactNode;
}

const ContainerStyled = styled.div<SplashProps>`
  filter: ${({ blur }) => (blur ? 'blur(3px)' : 'none')};
  position: relative;
  min-height: 100vh;
  padding: 96px 26px 40px;
  text-align: center;

  &:before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: radial-gradient(120% 60% at 50% 0%, rgba(0, 246, 210, 0.12), transparent 55%),
      radial-gradient(120% 60% at 50% 100%, rgba(218, 104, 245, 0.1), transparent 55%);
  }
`;

const TitleStyled = styled.div<SplashProps>`
  margin-bottom: ${({ size }) => (size === 'small' ? 40 : 72)}px;
  margin-top: 14px;
  text-align: center;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--cp-accent);
  opacity: 0.85;
  text-shadow: 0 0 16px rgba(0, 246, 210, 0.35);
`;

const backButtonStyle = css`
  top: 23px;
`;

const logoGlow = css`
  filter: drop-shadow(0 0 22px rgba(0, 246, 210, 0.5)) drop-shadow(0 0 30px rgba(218, 104, 245, 0.22));
`;

export const Splash: React.FC<SplashProps> = ({
  size, blur, onReturn, children,
}) => (
  <ContainerStyled blur={blur}>
    {onReturn && <BackButton onClick={onReturn} className={backButtonStyle} />}
    <Logo size={size} className={logoGlow} />
    <TitleStyled size={size}>
      Confidential DeFi Platform
      {' '}
      <br />
      and Cryptocurrency
    </TitleStyled>
    {children}
  </ContainerStyled>
);

export default Splash;
