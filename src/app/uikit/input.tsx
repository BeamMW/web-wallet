import React from 'react';
import { styled } from '@linaria/react';
import { isNil } from '@core/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  valid?: boolean;
  variant?: 'regular' | 'gray' | 'send';
  margin?: 'none' | 'large';
}

const ContainerStyled = styled.div<InputProps>`
  position: relative;
  min-height: 53px;
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
    color: white;
    opacity: 0.5;
    font-size: 14px;
    transform: translateX(1px);
  }
`;

const InputRegularStyled = styled(InputStyled)`
  border-color: ${({ valid }) => (valid ? 'var(--color-green)' : 'var(--color-red)')};
`;

const InputGrayStyled = styled(InputStyled)`
  border-width: 1px;
  border-color: ${({ valid }) => (valid ? 'rgba(255,255,255,0.3)' : 'var(--color-red)')};
`;

const InputSendStyled = styled(InputGrayStyled)`
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.34px;
  color: var(--color-purple);
`;

const LabelStyled = styled.div<InputProps>`
  margin-top: 4px;
  font-size: 14px;
  font-style: italic;
  color: ${({ valid }) => (valid ? 'var(--color-gray)' : 'var(--color-red)')};
`;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    valid = true,
    variant = 'regular',
    margin = 'none',
    className,
    ...rest
  }, ref) => {
    const InputComponent = {
      regular: InputRegularStyled,
      gray: InputGrayStyled,
      send: InputSendStyled,
    }[variant];

    return (
      <ContainerStyled className={className} margin={margin}>
        <InputComponent ref={ref} valid={valid} {...rest} />
        {!isNil(label) && <LabelStyled valid={valid}>{label}</LabelStyled>}
      </ContainerStyled>
    );
  },
);

export default Input;
