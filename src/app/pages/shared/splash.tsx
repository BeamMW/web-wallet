import React from 'react';
import { styled } from '@linaria/react';
import Logo from './logo';
import BackLink from './back-link';
import { isNil } from '@core/utils';

interface SplashProps {
  size?: 'large' | 'small';
  blur?: boolean;
  onBackClick?: React.MouseEventHandler;
}

const ContainerStyled = styled.div<SplashProps>`
  filter: ${({ blur }) => (blur ? 'blur(3px)' : 'none')};
  position: relative;
  height: 550px;
  padding: 70px 30px 0;
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

export const Splash: React.FC<SplashProps> = ({
  size,
  blur,
  onBackClick,
  children,
}) => (
  <ContainerStyled blur={blur}>
    {!isNil(onBackClick) && <BackLink onClick={onBackClick} />}
    <Logo size={size} />
    <TitleStyled size={size}>Scalable confidential cryptocurrency</TitleStyled>
    {children}
  </ContainerStyled>
);

export default Splash;
