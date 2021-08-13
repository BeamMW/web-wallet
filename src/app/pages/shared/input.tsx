import React, { HTMLAttributes } from 'react';
import { styled } from '@linaria/react';
import { isNil } from '@core/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const ContainerStyled = styled.div`
  position: relative;
  margin-bottom: 50px;
`;

const InputStyled = styled.input<InputProps>`
  width: 100%;
  height: 33px;
  line-height: 31px;

  border: none;
  border-bottom: 2px solid
    ${({ error }) =>
      isNil(error) ? 'var(--color-primary)' : 'var(--color-failed)'};
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

const ErrorStyled = styled.div`
  position: absolute;
  top: 33px;
  left: 0;
  line-height: 26px;
  font-size: 13px;
  color: var(--color-failed);
`;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error, ...rest }, ref) => (
    <ContainerStyled>
      <InputStyled ref={ref} error={error} {...rest} />
      {!isNil(error) && <ErrorStyled>{error}</ErrorStyled>}
    </ContainerStyled>
  ),
);

export default Input;
