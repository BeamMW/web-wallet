import React from 'react';
import { styled } from '@linaria/react';

const FooterStyled = styled.div<FooterProps>`
  position: absolute;
  bottom: ${({ margin }) => (margin === 'large' ? 40 : 20)}px;
  left: 0;
  width: 100%;
  padding: 0 30px;

  > button:last-child {
    margin-bottom: 0;
  }
`;

interface FooterProps {
  margin?: 'large' | 'small';
}

const Footer: React.FC<FooterProps> = ({ children, margin = 'large' }) => (
  <FooterStyled margin={margin}>{children}</FooterStyled>
);

export default Footer;
