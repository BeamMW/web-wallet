import { styled } from '@linaria/react';
import React from 'react';

interface ToggleProps {
  id?: string;
  value?: boolean;
  onChange?: React.ChangeEventHandler;
}

const ContainerStyled = styled.label`
  position: relative;
  width: 36px;
  height: 20px;
  cursor: pointer;
`;

const InputStyled = styled.input`
  position: absolute;
  z-index: -1;
  top: 0;
  left: 0;
  opacity: 0;
`;

const TrackStyled = styled.div`
  width: 100%;
  height: 100%;
  border: solid 1px var(--cp-line);
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.04);
  transition: border-color 0.15s, background-color 0.15s, box-shadow 0.15s;

  input[type='checkbox']:checked ~ & {
    border-color: var(--cp-accent);
    background-color: rgba(0, 246, 210, 0.12);
    box-shadow: 0 0 12px -3px rgba(0, 246, 210, 0.6);
  }
`;

const SliderStyled = styled.div<{ active: boolean }>`
  position: absolute;
  top: 2px;
  left: 2px;
  background-color: var(--cp-muted);
  width: 16px;
  height: 16px;
  border-radius: 50%;
  transition: left 0.15s, background-color 0.15s, box-shadow 0.15s;

  input[type='checkbox']:checked ~ & {
    left: 18px;
    background-color: var(--cp-accent);
    box-shadow: 0 0 10px var(--cp-accent);
  }
`;

const Toggle: React.FC<ToggleProps> = ({ id, value, onChange }) => (
  <ContainerStyled htmlFor={id}>
    <InputStyled id={id} type="checkbox" checked={value} onChange={onChange} />
    <TrackStyled />
    <SliderStyled active={value} />
  </ContainerStyled>
);

export default Toggle;
