import React from 'react';
import { styled } from '@linaria/react';

import Title from './Title';

interface SectionProps {
  title?: string;
  variant?: 'regular' | 'gray';
}

const SectionStyled = styled.div`
  margin: 0 -10px;
  padding-top: 20px;
  text-align: left;
`;

const SectionGrayStyled = styled.div`
  margin: 0 -30px;
  margin-bottom: 20px;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.05);
  text-align: left;
`;

const Section: React.FC<SectionProps> = ({
  title,
  variant = 'regular',
  children,
}) => {
  const SectionComponent = {
    regular: SectionStyled,
    gray: SectionGrayStyled,
  }[variant];

  return (
    <SectionComponent>
      <Title>{title}</Title>
      {children}
    </SectionComponent>
  );
};

export default Section;
