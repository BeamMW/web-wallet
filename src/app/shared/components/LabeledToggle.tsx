import { styled } from '@linaria/react';
import React from 'react';

interface LabeledToggleProps {
  left?: string;
  right?: string;
  value?: boolean;
  onChange?: (value: boolean) => void;
}

const ContainerStyled = styled.button`
  display: flex;
  position: relative;
  width: 224px;
  height: 32px;
  line-height: 32px;
  padding: 0;
  border-radius: 16px;
  border: none;
  background-color: rgba(255, 255, 255, 0.1);
  font-family: 'SFProDisplay';
  color: var(--color-gray);
  cursor: pointer;
`;

const LabelStyled = styled.div`
  width: 50%;
`;

const SliderStyled = styled.div<{ active: boolean }>`
  position: absolute;
  top: 0;
  left: ${({ active }) => (!active ? '0' : '50%')};
  width: 50%;
  height: 100%;
  line-height: 30px;
  border: 1px solid var(--color-green);
  border-radius: 16px;
  background-color: #206978;
  color: var(--color-green);
`;

const LabeledToggle: React.FC<LabeledToggleProps> = ({
  left = 'off', right = 'on', value, onChange,
}) => {
  const handleClick: React.MouseEventHandler = () => {
    const next = !value;
    onChange(next);
  };

  return (
    <ContainerStyled type="button" onClick={handleClick}>
      <SliderStyled active={value}>{!value ? left : right}</SliderStyled>
      <LabelStyled>{left}</LabelStyled>
      <LabelStyled>{right}</LabelStyled>
    </ContainerStyled>
  );
};

export default LabeledToggle;
