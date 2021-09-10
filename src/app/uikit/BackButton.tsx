import React from 'react';
import { css } from '@linaria/core';

import AngleBackIcon from '@icons/icon-angle-back.svg';

import Button from './Button';

interface BackButtonProps {
  onClick: React.MouseEventHandler;
}

const backStyle = css`
  position: fixed;
  z-index: 3;
  top: 73px;
  left: 15px;
`;

const BackLink: React.FC<BackButtonProps> = ({ onClick }) => (
  <Button variant="icon" icon={AngleBackIcon} className={backStyle} onClick={onClick} />
);

export default BackLink;
