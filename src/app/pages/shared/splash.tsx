import React from 'react';
import { styled } from '@linaria/react';
import Logo from './logo';

interface SplashProps {
  size?: 'large' | 'small';
  blur?: boolean;
}

const ContainerStyled = styled.div<SplashProps>`
  filter: ${({ blur }) => (blur ? 'blur(3px)' : 'none')};
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
  color: var(--color-receive);
`;

const Splash: React.FC<SplashProps> = ({ size, blur, children }) => (
  <ContainerStyled blur={blur}>
    <Logo size={size} />
    <TitleStyled size={size}>Scalable confidential cryptocurrency</TitleStyled>
    {children}
  </ContainerStyled>
);

export default Splash;
