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
const smallLogoClassName = css`
  margin: 0 15px;
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
    width: 45,
    height: 45,
  },
};

const Logo: React.FC<LogoProps> = ({ size = 'large' }) => {
  const viewBox = '0 0 159 159';
  const dimensions = DIMENSIONS[size];
  return size === 'icon' ? (
    <LogoSmall {...dimensions} className={smallLogoClassName} />
  ) : (
    <LogoIcon {...dimensions} viewBox={viewBox} className={LogoClassName} />
  );
};

export default Logo;
