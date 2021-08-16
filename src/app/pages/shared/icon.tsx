import React from 'react';
import { styled } from '@linaria/react';

import addIcon from './icons/icon-add.svg';

interface IconProps {
  name: string;
  size?: number;
}

const ImageStyled = styled.img`
  vertical-align: sub;
  margin-right: 10px;
`;

const Icon: React.FC<IconProps> = ({ name, size = 16 }) => {
  console.log(addIcon);

  return (
    <ImageStyled
      width={size}
      height={size}
      src={`sprite.svg#icon-${name}-usage`}
      alt=""
    />
  );
};

export default Icon;
