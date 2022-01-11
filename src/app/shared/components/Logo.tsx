import React from 'react';
import { css } from '@linaria/core';

import { LogoIcon, LogoSmall } from '@app/shared/icons';

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
    height: 159,
  },
  small: {
    width: 100,
    height: 100,
  },
  icon: {
    width: 42,
    height: 42,
  },
};

const Logo: React.FC<LogoProps> = ({ size = 'large' }) => {
  const viewBox = '0 0 159 159';
  const dimensions = DIMENSIONS[size];
  return size === 'icon' ? (
    <LogoSmall {...dimensions} className={LogoClassName} />
  ) : (
    <LogoIcon {...dimensions} viewBox={viewBox} className={LogoClassName} />
  );
};

export default Logo;
