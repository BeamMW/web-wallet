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
  value: string;
  selected: number;
  error?: string;
  pallete?: 'purple' | 'blue';
  onChange?: (value: [string, number]) => void;
}

const REG_AMOUNT = /^(?!0\d)(\d+)(\.)?(\d+)?$/;

const AmountInput: React.FC<AmountInputProps> = ({
  value,
  selected,
  error,
  pallete = 'purple',
  onChange,
}) => {
  const assets = useStore($assets);

  const options = assets
    .map(({ asset_id, metadata_pairs }) => (
      <span>
        <AssetIcon asset_id={asset_id} />
        { metadata_pairs.UN }
      </span>
    ));

  const handleInput: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value: raw } = event.target;

    if (raw !== '' && !REG_AMOUNT.test(raw)) {
      return;
    }

    const next = parseFloat(raw) > AMOUNT_MAX
      ? AMOUNT_MAX.toString() : raw;
    onChange([next, selected]);
  };

  const handleSelect = (next: number) => {
    onChange(['', next]);
  };

  return (
    <ContainerStyled>
      <Input
        variant="amount"
        valid={isNil(error)}
        label={error}
        value={value}
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
