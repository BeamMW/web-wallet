import React from 'react';
import { styled } from '@linaria/react';
import { isNil } from '@core/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  variant?: 'regular' | 'gray';
  margin?: 'none' | 'large';
}

export const ContainerStyled = styled.div<InputProps>`
  position: relative;
  margin-bottom: ${({ margin }) => (margin === 'none' ? 0 : 50)}px;
`;

const InputStyled = styled.input<InputProps>`
  width: 100%;
  height: 33px;
  line-height: 31px;
  border: none;
  border-bottom: 2px solid transparent;
  background-color: transparent;
  font-size: 14px;
  color: white;

  &::placeholder {
    position: absolute;
    top: 0;
    left: 3px;
    line-height: inherit;
    color: white;
    opacity: 0.5;
  }
`;

const InputRegularStyled = styled(InputStyled)`
  border-color: ${({ error }) => (isNil(error) ? 'var(--color-green)' : 'var(--color-red)')};
`;

const InputGrayStyled = styled(InputStyled)`
  border-width: 1px;
  border-color: ${({ error }) => (isNil(error) ? 'rgba(255,255,255,0.3)' : 'var(--color-red)')};
`;

const ErrorStyled = styled.div`
  position: absolute;
  top: 33px;
  left: 0;
  line-height: 26px;
  font-size: 13px;
  color: var(--color-failed);
`;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      error, variant = 'regular', margin = 'none', className, ...rest
    },
    ref,
  ) => {
    const InputComponent = {
      regular: InputRegularStyled,
      gray: InputGrayStyled,
    }[variant];

    return (
      <ContainerStyled className={className} margin={margin}>
        <InputComponent ref={ref} error={error} {...rest} />
        {!isNil(error) && <ErrorStyled>{error}</ErrorStyled>}
      </ContainerStyled>
    );
  },
);

export default Input;
