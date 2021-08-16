import React from 'react';
import { styled } from '@linaria/react';

interface SplashProps {
  small?: boolean;
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
  margin-bottom: ${({ small }) => (small ? 50 : 100)}px;
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-receive);
`;

const LogoStyled = styled.object`
  display: block;
  margin: 0 auto 20px;
`;

const Splash: React.FC<SplashProps> = ({ small, blur, children }) => (
  <ContainerStyled blur={blur}>
    <LogoStyled
      type="image/svg+xml"
      data="./assets/logo.svg"
      width={small ? 100 : 159}
      height={small ? 88 : 139}
    ></LogoStyled>
    <TitleStyled small={small}>
      Scalable confidential cryptocurrency
    </TitleStyled>
    {children}
  </ContainerStyled>
);

export default Splash;
