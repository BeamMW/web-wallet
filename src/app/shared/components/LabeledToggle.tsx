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
  width: 100%;
  max-width: 240px;
  height: 34px;
  line-height: 34px;
  padding: 0;
  clip-path: var(--cp-clip-sm);
  border: 1px solid var(--cp-line);
  background-color: rgba(0, 0, 0, 0.35);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--cp-muted);
  cursor: pointer;
`;

const LabelStyled = styled.div`
  width: 50%;
  text-align: center;
`;

const SliderStyled = styled.div<{ active: boolean }>`
  position: absolute;
  top: -1px;
  left: ${({ active }) => (!active ? '-1px' : 'calc(50% + 1px)')};
  width: 50%;
  height: calc(100% + 2px);
  line-height: 34px;
  text-align: center;
  clip-path: var(--cp-clip-sm);
  border: 1px solid var(--cp-accent);
  background-color: rgba(0, 246, 210, 0.12);
  color: var(--cp-accent);
  box-shadow: 0 0 14px -4px rgba(0, 246, 210, 0.6);
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
