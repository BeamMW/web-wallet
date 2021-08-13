import React from 'react';
import { styled } from '@linaria/react';

const ContainerStyled = styled.div`
  padding: 70px 0 50px;
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-receive);
`;

const LogoStyled = styled.object`
  display: block;
  margin: 0 auto 20px;
`;

const Logo: React.FC = () => (
  <ContainerStyled>
    <LogoStyled
      type="image/svg+xml"
      data="./assets/logo.svg"
      width="100"
      height="88"
    ></LogoStyled>
    Scalable confidential cryptocurrency
  </ContainerStyled>
);

export default Logo;
