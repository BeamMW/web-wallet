import React from 'react';
import { styled } from '@linaria/react';

import AngleBackIcon from '@icons/icon-angle-back.svg';

interface BackLinkProps {
  onClick: React.MouseEventHandler;
}

const LinkStyled = styled.a`
  position: absolute;
  top: 23px;
  left: 15px;
`;

export const BackLink: React.FC<BackLinkProps> = ({ onClick }) => (
  <LinkStyled href="#" onClick={onClick}>
    <AngleBackIcon />
  </LinkStyled>
);

export default BackLink;
