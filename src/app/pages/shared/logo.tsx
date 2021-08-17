import React from 'react';
import { css } from '@linaria/core';

import LogoIcon from '@icons/icon-logo.svg';

interface LogoProps {
  size?: 'large' | 'small' | 'icon';
}

const LogoClassName = css`
  display: block;
  margin: 0 auto 20px;
`;

const DIMENSIONS = {
  large: {
    width: 159,
    height: 139,
  },
  small: {
    width: 100,
    height: 188,
  },
  icon: {
    width: 42,
    height: 37,
  },
};

const Logo: React.FC<LogoProps> = ({ size = 'large' }) => {
  const viewBox = '0 0 159 139';
  const dimensions = DIMENSIONS[size];
  return (
    <LogoIcon {...dimensions} viewBox={viewBox} className={LogoClassName} />
  );
};

export default Logo;
