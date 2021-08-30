import React from 'react';
import { styled } from '@linaria/react';

import Logo from './Logo';
import BackButton from './BackButton';

interface WindowProps {
  title?: string;
  blur?: boolean;
  color?: 'default' | 'blue' | 'purple';
  onBackClick?: React.MouseEventHandler;
}

const ContainerStyled = styled.div<WindowProps>`
  position: relative;
  height: 550px;
  padding: 0 30px;
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
    background-image: linear-gradient(
      to top,
      rgba(3, 91, 143, 0),
      ${({ color }) => {
    switch (color) {
      case 'blue':
        return 'var(--color-blue)';
      case 'purple':
        return 'var(--color-purple)';
      default:
        return '#035b8f';
    }
  }}
        150%
    );
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
  line-height: 72px;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 3px;
`;

export const Window: React.FC<WindowProps> = ({
  title,
  blur,
  color = 'default',
  onBackClick,
  children,
}) => (
  <ContainerStyled blur={blur} color={color}>
    <FrameStyled>
      <Logo size="icon" />
    </FrameStyled>
    <TitleStyled>{title}</TitleStyled>
    {onBackClick && <BackButton onClick={onBackClick} />}
    {children}
  </ContainerStyled>
);

export default Window;
