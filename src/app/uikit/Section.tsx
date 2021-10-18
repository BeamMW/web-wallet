import React, { useState } from 'react';
import { styled } from '@linaria/react';

import { isNil } from '@app/core/utils';
import Title from './Title';
import Angle from './Angle';

interface SectionProps {
  title?: string;
  subtitle?: string;
  collapse?: boolean;
  variant?: 'regular' | 'gray';
}

const SectionStyled = styled.div`
  position: relative;
  margin: 0 -10px;
  padding-top: 20px;
  text-align: left;
`;

const SectionGrayStyled = styled.div`
  position: relative;
  margin: 0 -30px;
  margin-bottom: 20px;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.05);
  text-align: left;
`;

const ButtonStyled = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  cursor: pointer;
  border: none;
  background-color: transparent;
  text-decoration: none;
  color: white;
  white-space: nowrap;
`;

const Section: React.FC<SectionProps> = ({
  title,
  collapse = false,
  variant = 'regular',
  subtitle,
  children,
}) => {
  const [hidden, setHidden] = useState(collapse);

  const handleMouseDown: React.MouseEventHandler = () => {
    setHidden(!hidden);
  };

  const SectionComponent = {
    regular: SectionStyled,
    gray: SectionGrayStyled,
  }[variant];

  return (
    <SectionComponent>
      { collapse && (
      <ButtonStyled type="button" onMouseDown={handleMouseDown}>
        <Angle value={hidden ? 180 : 0} margin={hidden ? 3 : 3} />
      </ButtonStyled>
      )}
      { !isNil(title) && (<Title>{title}</Title>) }
      { !isNil(subtitle) && (<Title variant="subtitle">{subtitle}</Title>) }
      { !hidden && children }
    </SectionComponent>
  );
};

export default Section;
