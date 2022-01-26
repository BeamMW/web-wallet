import React from 'react';
import { css, cx } from '@linaria/core';

import { AngleBackIcon } from '@app/shared/icons';

import Button from './Button';

interface BackButtonProps {
  className?: string;
  onClick: React.MouseEventHandler;
}

const backStyle = css`
  position: fixed;
  z-index: 3;
  top: 73px;
  left: 15px;
`;

const BackButton: React.FC<BackButtonProps> = ({ className, onClick }) => (
  <Button variant="icon" icon={AngleBackIcon} className={cx(backStyle, className)} onClick={onClick} />
);

export default BackButton;
