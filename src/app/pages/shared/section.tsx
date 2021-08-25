import React from 'react';
import { styled } from '@linaria/react';

interface SectionProps {
  title?: string;
}

const SectionStyled = styled.div<SectionProps>`
  margin: 0 -30px;
  padding: 20px 8px 0;
`;

const TitleStyled = styled.h3`
  margin: 0;
  margin-bottom: 20px;
  padding-left: 12px;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  text-align: left;
  letter-spacing: 1px;
  color: white;
`;

export const Section: React.FC<SectionProps> = ({ title, children }) => (
  <SectionStyled>
    <TitleStyled>{title}</TitleStyled>
    {children}
  </SectionStyled>
);

export default Section;
