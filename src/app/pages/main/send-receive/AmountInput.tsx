/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { useStore } from 'effector-react';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';

import {
  Input, Select,
} from 'app/uikit';

import { isNil } from '@app/core/utils';

import {
  $amount,
  $amountError,
  $selected,
  $options,
  onAmountInput,
  setSelected,
} from './model';

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

const AmountInput = () => {
  const amount = useStore($amount);
  const amountError = useStore($amountError);
  const selected = useStore($selected);
  const options = useStore($options);

  return (
    <ContainerStyled>
      <Input
        variant="send"
        valid={isNil(amountError)}
        label={amountError}
        value={amount}
        maxLength={16}
        placeholder="0"
        className={containerStyle}
        onInput={onAmountInput}
      />
      <Select
        options={options}
        selected={selected}
        className={selectClassName}
        onSelect={setSelected}
      />
    </ContainerStyled>
  );
};

export default AmountInput;
