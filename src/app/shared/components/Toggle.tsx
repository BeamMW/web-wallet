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
  ]z-index: -1;
  top: 0;
  left: 0;
  opacity: 0;
`;

const TrackStyled = styled.div`
  width: 100%;
  height: 100%;
  border: solid 1px var(--color-disabled);
  border-radius: 10px;
  background-color: rgba(141, 161, 173, 0.1);

  input[type='checkbox']:checked ~ & {
    border-color: var(--color-green);
    background-color: rgba(0, 251, 209, 0.1);
  }
`;

const SliderStyled = styled.div<{ active: boolean }>`
  position: absolute;
  top: 2px;
  left: 2px;
  background-color: var(--color-disabled);
  width: 16px;
  height: 16px;
  border-radius: 50%;

  input[type='checkbox']:checked ~ & {
    left: 18px;
    background-color: var(--color-green);
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
