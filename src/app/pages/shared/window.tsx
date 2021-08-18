import React from 'react';
import { styled } from '@linaria/react';

import AngleBackIcon from '@icons/icon-angle-back.svg';

import Logo from './logo';

interface WindowhProps {
  title: string;
  onBackClick?: React.MouseEventHandler;
}

const ContainerStyled = styled.div`
  position: relative;
  height: 550px;
  padding: 20px;
  text-align: center;

  &:before {
    content: '';
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    width: 100%;
    height: 100px;
    background-image: linear-gradient(to top, rgba(3, 91, 143, 0), #035b8f);
  }
`;

const FrameStyled = styled.div`
  overflow: hidden;
  position: absolute;
  top: -40px;
  left: 50%;
  width: 42px;
  height: 30px;
  transform: translateX(-50%);
`;

const TitleStyled = styled.h2`
  margin: 0;
  margin-bottom: 26px;
  font-size: 20px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 3px;
`;

const BackStyled = styled.a`
  position: absolute;
  top: 20px;
  left: 20px;
`;

const Window: React.FC<WindowhProps> = ({ title, onBackClick, children }) => (
  <ContainerStyled>
    <FrameStyled>
      <Logo size="icon" />
    </FrameStyled>
    <TitleStyled>{title}</TitleStyled>
    {onBackClick && (
      <BackStyled href="#" onClick={onBackClick}>
        <AngleBackIcon />
      </BackStyled>
    )}
    {children}
  </ContainerStyled>
);

export default Window;
