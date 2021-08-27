import React, { useState } from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';

import { Input, Select } from '@uikit';

interface AssetInpuProps {
  assets: string[];
  onSelect: (value: number) => void;
}

const inputClassName = css`
  flex-grow: 1;
`;

const selectClassName = css`
  align-self: center;
`;

const ContainerStyled = styled.div`
  position: relative;
  display: flex;
`;

export const AssetInput: React.FC<AssetInpuProps> = ({ assets, onSelect }) => {
  const [selected, setSelected] = useState(0);

  const handleSelect = (value: number) => {
    setSelected(value);
    onSelect(value);
  };

  return (
    <ContainerStyled>
      <Input variant="gray" className={inputClassName} />
      <Select
        options={assets}
        selected={selected}
        className={selectClassName}
        onSelect={handleSelect}
      />
    </ContainerStyled>
  );
};

export default AssetInput;
