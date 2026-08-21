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
  min-height: 50px;
  margin-bottom: ${({ margin }) => (margin === 'none' ? 0 : 28)}px;
`;

const InputStyled = styled.input<InputProps>`
  width: 100%;
  height: 48px;
  padding: 13px 14px;
  border: 1px solid var(--cp-line);
  outline: none;
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.02em;
  color: var(--cp-text);
  clip-path: var(--cp-clip);
  background-color: rgba(0, 0, 0, 0.35);
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;

  &::placeholder {
    opacity: 1;
    font-size: 13px;
    font-style: normal;
    letter-spacing: 0.02em;
    color: var(--cp-muted);
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
    border-color: var(--cp-accent);
    background-color: rgba(0, 0, 0, 0.5);
    box-shadow: 0 0 0 1px rgba(0, 246, 210, 0.2), 0 0 18px -6px rgba(0, 246, 210, 0.5);
  }

  &.invalid {
    border-color: var(--cp-danger);
    color: var(--cp-danger);
    box-shadow: 0 0 0 1px rgba(242, 95, 91, 0.2);
  }
`;

const InputRegularStyled = styled(InputStyled)`
  border-color: ${({ valid }) => (valid ? 'var(--cp-line)' : 'var(--cp-danger)')};
`;

const InputGrayStyled = styled(InputStyled)`
  border-color: ${({ valid }) => (valid ? 'var(--cp-line-2)' : 'var(--cp-danger)')};
`;

const InputAmountStyled = styled(InputGrayStyled)<{ pallete: string }>`
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: ${({ pallete }) => `var(--color-${pallete})`};
`;

const LabelStyled = styled.div<InputProps>`
  margin-top: 6px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  color: ${({ valid }) => (valid ? 'var(--cp-muted)' : 'var(--cp-danger)')};
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
