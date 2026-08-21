import React from 'react';
import { styled } from '@linaria/react';
import { ButtonVariant, Pallete } from '@core/types';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.FC;
  pallete?: Pallete;
  variant?: ButtonVariant;
}

const BaseButtonStyled = styled.button<ButtonProps>`
  &[disabled] {
    opacity: 0.5;

    &:hover,
    &:active {
      box-shadow: none !important;
      cursor: not-allowed !important;
    }
  }
`;

const ButtonStyled = styled(BaseButtonStyled)`
  display: block;
  width: 100%;
  max-width: 300px;
  margin: 0 auto 10px;
  padding: 14px 22px;
  border: none;
  cursor: pointer;
  clip-path: var(--cp-clip);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, ${({ pallete }) => `var(--color-${pallete})`} 100%, white 8%),
    ${({ pallete }) => `var(--color-${pallete})`}
  );
  text-align: center;
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${({ pallete }) => (pallete === 'purple' ? '#fff' : '#04121a')};
  box-shadow: 0 0 22px -8px ${({ pallete }) => `var(--color-${pallete})`};
  transition: box-shadow 0.15s, transform 0.12s, filter 0.15s;

  &:hover,
  &:active {
    transform: translateY(-1px);
    filter: brightness(1.07);
    box-shadow: 0 0 30px -6px ${({ pallete }) => `var(--color-${pallete})`};
    cursor: pointer;
  }

  > svg {
    vertical-align: sub;
    margin-right: 10px;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`;

const GhostButtonStyled = styled(ButtonStyled)`
  background: rgba(255, 255, 255, 0.04);
  color: var(--cp-text);
  border: 1px solid var(--cp-line);
  box-shadow: none;

  &:hover,
  &:active {
    filter: none;
    background: rgba(0, 246, 210, 0.08);
    border-color: ${({ pallete }) => `var(--color-${pallete})`};
    box-shadow: 0 0 18px -6px ${({ pallete }) => `var(--color-${pallete})`};
  }
`;

const BlockButtonStyled = styled(GhostButtonStyled)`
  width: 100%;
  max-width: none;
  padding: 16px;
  font-size: 13px;
  text-align: left;
  letter-spacing: 0.14em;
  color: ${({ pallete }) => `var(--color-${pallete})`};

  &:hover,
  &:active {
    transform: none;
    background: rgba(255, 255, 255, 0.06);
  }
`;

const IconButtonStyled = styled(BaseButtonStyled)`
  display: inline-block;
  vertical-align: sub;
  line-height: 0;
  margin: 0 10px;
  padding: 0;
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: ${({ pallete }) => `var(--color-${pallete})`};

  > svg {
    vertical-align: sub;
    width: 18px;
    height: 18px;
  }
`;

const LinkButtonStyled = styled(IconButtonStyled)`
  margin: 20px 0;
  font-size: 14px;
  font-weight: 700;
  color: ${({ pallete }) => `var(--color-${pallete})`};
`;

const VARIANTS = {
  regular: ButtonStyled,
  ghost: GhostButtonStyled,
  link: LinkButtonStyled,
  icon: IconButtonStyled,
  block: BlockButtonStyled,
};

const Button: React.FC<ButtonProps> = ({
  type = 'button',
  pallete = 'green',
  variant = 'regular',
  icon: IconComponent,
  children,
  ...rest
}) => {
  const ButtonComponent = VARIANTS[variant];

  return (
    <ButtonComponent type={type} pallete={pallete} {...rest}>
      {!!IconComponent && <IconComponent />}
      {children}
    </ButtonComponent>
  );
};

export default Button;
