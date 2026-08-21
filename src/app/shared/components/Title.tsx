import React from 'react';
import { styled } from '@linaria/react';

interface TitleProps {
  variant?: 'regular' | 'subtitle' | 'heading';
  children?: React.ReactNode;
}

const STYLE_BASE = {
  margin: 0,
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  fontWeight: 600,
  textTransform: 'uppercase',
  textAlign: 'left',
  letterSpacing: '0.14em',
  color: 'var(--cp-text)',
};

const HeadingStyled = styled.h2`
  line-height: 1.2;
  margin: 0;
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: var(--cp-text);
`;

const TitleStyled = styled.h3`
  ${STYLE_BASE}
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SubtitleStyled = styled.h4`
  ${STYLE_BASE}
  opacity: 0.5;
  margin-bottom: 10px;
`;

const VARIANTS = {
  regular: TitleStyled,
  subtitle: SubtitleStyled,
  heading: HeadingStyled,
};

const Title: React.FC<TitleProps> = ({ variant = 'regular', children }) => {
  const TitleComponent = VARIANTS[variant];
  return <TitleComponent>{children}</TitleComponent>;
};

export default Title;
