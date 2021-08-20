import React from 'react';
import { styled } from '@linaria/react';
import { isNil } from '@core/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.FC;
  color?: 'primary' | 'ghost';
}

const ButtonStyled = styled.button<ButtonProps>`
  display: block;
  width: 100%;
  max-width: 254px;
  margin: 0 auto;
  margin-bottom: 10px;
  padding: 12px 24px;
  border: none;
  border-radius: 22px;
  background-color: var(--color-green);
  text-align: center;
  font-weight: bold;
  font-size: 14px;
  color: var(--color-dark-blue);

  &:hover,
  &:active {
    box-shadow: 0 0 8px white;
    cursor: pointer;
  }

  &[disabled] {
    opacity: 0.5;

    &:hover, &:active {
      box-shadow: none
      cursor: not-allowed;
    }
  }

  > svg {
    vertical-align: sub;
    margin-right: 10px;
  }
`;

const GhostButtonStyled = styled(ButtonStyled)`
  background-color: var(--color-ghost);
  color: white;

  &:hover,
  &:active {
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.15);
    background-color: var(--color-ghost-active);
  }
`;

export const Button: React.FC<ButtonProps> = ({
  type = 'button',
  color = 'primary',
  icon: IconComponent,
  children,
  ...rest
}) => {
  const ButtonComponent = {
    primary: ButtonStyled,
    ghost: GhostButtonStyled,
  }[color];

  return (
    <ButtonComponent type={type} {...rest}>
      {!isNil(IconComponent) && <IconComponent />}
      {children}
    </ButtonComponent>
  );
};

export default Button;
