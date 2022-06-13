import React, { useState } from 'react';
import { styled } from '@linaria/react';
import Button from '@app/shared/components/Button';
import { IconEye, IconEyeCrossed } from '@app/shared/icons';
import { css } from '@linaria/core';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  valid?: boolean;
  variant?: 'regular' | 'gray' | 'amount';
  pallete?: 'purple' | 'blue';
  margin?: 'none' | 'large';
}

const ContainerStyled = styled.div<InputProps>`
  position: relative;
  min-height: 53px;
  margin-bottom: ${({ margin }) => (margin === 'none' ? 0 : 50)}px;
`;

const InputStyled = styled.input<InputProps>`
  width: 100%;
  height: 45px;
  line-height: 40px;
  padding: 15px;
  border: none;
  outline: none;
  // background-color: transparent;
  font-size: 14px;
  color: white;
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.05);

  &::placeholder {
    transform: translateX(1px);
    opacity: 0.2;
    font-size: 14px;
    font-weight: normal;
    font-stretch: normal;
    font-style: italic;
    line-height: normal;
    letter-spacing: 0.26px;
    color: #fff;
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus {
    background-color: rgba(255, 255, 255, 0.1);
  }

  &.invalid {
    background-color: rgba(255, 116, 107, 0.15);
    color: #ff625c;
  }
`;

const InputRegularStyled = styled(InputStyled)`
  border-color: ${({ valid }) => (valid ? 'var(--color-green)' : 'var(--color-red)')};
`;

const InputGrayStyled = styled(InputStyled)`
  border-width: 1px;
  border-color: ${({ valid }) => (valid ? 'rgba(255,255,255,0.3)' : 'var(--color-red)')};
`;

const InputAmountStyled = styled(InputGrayStyled)<{ pallete: string }>`
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.34px;
  color: ${({ pallete }) => `var(--color-${pallete})`};
`;

const LabelStyled = styled.div<InputProps>`
  margin-top: 4px;
  font-family: SFProDisplay;
  font-size: 14px;
  font-style: italic;
  color: ${({ valid }) => (valid ? 'var(--color-gray)' : 'var(--color-red)')};
`;

const menuEyeStyle = css`
  position: absolute;
  z-index: 3;
  top: 12px;
  right: 12px;
  margin: 0;
`;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    label, valid = true, variant = 'regular', margin = 'none', pallete, className, ...rest
  }, ref) => {
    const InputComponent = {
      regular: InputRegularStyled,
      gray: InputGrayStyled,
      amount: InputAmountStyled,
    }[variant];

    const [inputVisible, setInputVisible] = useState(false);
    const [inputValue, setInputValue] = useState(rest.value ?? '');

    const inputHandler = (e) => {
      if (rest?.onChange) rest?.onChange(e);
      setInputValue(e.target.value);
    };

    return (
      <ContainerStyled className={className} margin={margin}>
        <InputComponent
          ref={ref}
          valid={valid}
          pallete={pallete}
          {...rest}
          type={inputVisible ? 'text' : rest.type}
          className={!valid ? 'invalid' : ''}
          onChange={inputHandler}
        />
        {!!label && <LabelStyled valid={valid}>{label}</LabelStyled>}

        {rest.type === 'password' && inputValue?.toString().length ? (
          <Button
            variant="icon"
            icon={!inputVisible ? IconEye : IconEyeCrossed}
            className={menuEyeStyle}
            onClick={(e) => {
              setInputVisible((v) => !v);

              e.preventDefault();
              e.stopPropagation();
            }}
          />
        ) : null}
      </ContainerStyled>
    );
  },
);

export default Input;
