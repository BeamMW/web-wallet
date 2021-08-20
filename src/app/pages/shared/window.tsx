import React from 'react';
import { styled } from '@linaria/react';

import AngleBackIcon from '@icons/icon-angle-back.svg';

import Logo from './logo';
import BackLink from './back-link';

interface WindowProps {
  title?: string;
  blur?: boolean;
  onBackClick?: React.MouseEventHandler;
}

const ContainerStyled = styled.div<WindowProps>`
  position: relative;
  height: 550px;
  padding: 30px;
  text-align: center;
  filter: ${({ blur }) => (blur ? 'blur(3px)' : 'none')};

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

export const Window: React.FC<WindowProps> = ({
  title,
  blur,
  onBackClick,
  children,
}) => (
  <ContainerStyled blur={blur}>
    <FrameStyled>
      <Logo size="icon" />
    </FrameStyled>
    <TitleStyled>{title}</TitleStyled>
    {onBackClick && <BackLink onClick={onBackClick} />}
    {children}
  </ContainerStyled>
);

export default Window;
