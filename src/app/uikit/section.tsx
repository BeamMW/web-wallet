import React from 'react';
import { styled } from '@linaria/react';

interface SectionProps {
  title?: string;
  variant?: 'regular' | 'gray';
}

const TitleStyled = styled.h3`
  margin: 0;
  margin-bottom: 20px;
  padding-left: 12px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  text-align: left;
  letter-spacing: 1px;
  color: white;
`;

const SectionStyled = styled.div`
  margin: 0 -30px;
  padding: 20px 8px 0;
`;

const SectionGrayStyled = styled(SectionStyled)`
  margin-bottom: 20px;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.05);

  > ${TitleStyled} {
    padding-left: 0;
  }
`;

export const Section: React.FC<SectionProps> = ({
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
      <TitleStyled>{title}</TitleStyled>
      {children}
    </SectionComponent>
  );
};

export default Section;
