import React from 'react';
import { styled } from '@linaria/react';

import AngleBackIcon from '@icons/icon-angle-back.svg';

interface BackLinkProps {
  onClick: React.MouseEventHandler;
}

const LinkStyled = styled.a`
  position: absolute;
  top: 20px;
  left: 20px;
`;

export const BackLink: React.FC<BackLinkProps> = ({ onClick }) => (
  <LinkStyled href="#" onClick={onClick}>
    <AngleBackIcon />
  </LinkStyled>
);

export default BackLink;
