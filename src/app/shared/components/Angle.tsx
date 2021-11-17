import React from 'react';
import { styled } from '@linaria/react';

import { AngleSmallUpIcon } from '@app/shared/icons';

interface AngleProps {
  value?: number;
  margin?: number;
  className?: string;
}

const ContainerStyled = styled.div<AngleProps>`
  display: inline-block;
  position: relative;
  width: 13px;
  height: 13px;
  transform-origin: center;
  transform: translateY(${({ margin }) => `${margin}px`}) rotate(${({ value }) => `${value}deg`});

  > svg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

const Angle: React.FC<AngleProps> = ({ value = 0, margin = 0, className }) => (
  <ContainerStyled value={value} margin={margin} className={className}>
    <AngleSmallUpIcon />
  </ContainerStyled>
);

export default Angle;
