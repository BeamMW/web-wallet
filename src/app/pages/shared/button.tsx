import React from 'react';
import { styled } from '@linaria/react';

interface ButtonProps {
  type?: 'submit' | 'reset' | 'button';
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

  &:hover,
  &:active {
    box-shadow: 0 0 8px white;
  }
`;

const Button: React.FC<ButtonProps> = ({
  type = 'button',
  color = 'primary',
  children,
  ...rest
}) => (
  <ButtonStyled type={type} color={color} {...rest}>
    {children}
  </ButtonStyled>
);

export default Button;
