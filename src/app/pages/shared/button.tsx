import React from 'react';
import { styled } from '@linaria/react';
import { isNil } from '@core/utils';

import Icon from './icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: string;
  color?: 'primary' | 'ghost';
}

const ButtonStyled = styled.button<ButtonProps>`
  display: block;
  width: 100%;
  padding: 12px 24px;
  border: none;
  border-radius: 22px;
  background-color: ${({ color }) => `var(--color-${color})`};
  text-align: center;
  font-weight: bold;
  font-size: 16px;
  color: ${({ color }) =>
    `var(--color-${color === 'ghost' ? 'white' : 'blue'})`};

  &:hover,
  &:active {
    box-shadow: 0 0 8px white;
    cursor: pointer;
  }
`;

const Button: React.FC<ButtonProps> = ({
  type = 'button',
  color = 'primary',
  icon,
  children,
  ...rest
}) => (
  <ButtonStyled type={type} color={color} {...rest}>
    {!isNil(icon) && <Icon name={icon} />}
    {children}
  </ButtonStyled>
);

export default Button;
