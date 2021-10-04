/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { useStore } from 'effector-react';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';

import {
  Input, Select,
} from '@uikit';

import { isNil } from '@app/core/utils';

import { AMOUNT_MAX } from '@app/model/rates';
import { $assets } from '@app/model/wallet';
import AssetIcon from './AssetIcon';

const ContainerStyled = styled.div`
  position: relative;
  display: flex;
  margin-bottom: 20px;
`;

const selectClassName = css`
  align-self: flex-start;
  margin-top: 10px;
`;

const containerStyle = css`
  flex-grow: 1;
`;

interface AmountInputProps {
  error?: string;
  pallete?: 'purple' | 'blue';
  onChange?: (value: [string, number]) => void;
}

const REG_AMOUNT = /^(?:[1-9]\d*|0)?(?:\.(\d+)?)?$/;

const AmountInput: React.FC<AmountInputProps> = ({
  error,
  pallete = 'purple',
  onChange,
}) => {
  const [amount, setAmount] = useState('');
  const [selected, setSelected] = useState(0);

  const assets = useStore($assets);
  const target = assets[selected];

  const options = assets
    .map(({ asset_id, metadata_pairs }) => (
      <span>
        <AssetIcon asset_id={asset_id} />
        { metadata_pairs.UN }
      </span>
    ));

  const handleInput: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.target;

    if (!REG_AMOUNT.test(value)) {
      return;
    }

    const next = parseFloat(value) > AMOUNT_MAX
      ? AMOUNT_MAX.toString() : value;
    setAmount(next);
    onChange([next, selected]);
  };

  const handleSelect = (value: number) => {
    setSelected(value);
    setAmount('');
    onChange(['', value]);
  };

  return (
    <ContainerStyled>
      <Input
        variant="amount"
        valid={isNil(error)}
        label={error}
        value={amount}
        pallete={pallete}
        maxLength={16}
        placeholder="0"
        className={containerStyle}
        onInput={handleInput}
      />
      <Select
        options={options}
        selected={selected}
        className={selectClassName}
        onSelect={handleSelect}
      />
    </ContainerStyled>
  );
};

export default AmountInput;
