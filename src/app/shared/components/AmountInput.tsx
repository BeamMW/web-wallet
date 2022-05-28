import React from 'react';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';

import Select, { Option } from '@app/shared/components/Select';

import { convertLowAmount, truncate } from '@core/utils';

import { useSelector } from 'react-redux';
import { selectAssets } from '@app/containers/Wallet/store/selectors';
import { AMOUNT_MAX, AMOUNT_MIN } from '@app/containers/Wallet/constants';
import { TransactionAmount } from '@app/containers/Wallet/interfaces';
import Input from './Input';
import AssetIcon from './AssetIcon';
import Rate from './Rate';

const ContainerStyled = styled.div`
  position: relative;
  display: flex;
  margin-bottom: 20px;
`;

const LabelStyled = styled.div`
  display: inline-block;
  vertical-align: bottom;
  line-height: 26px;
`;

const selectClassName = css`
  align-self: flex-start;
  margin-top: 10px;
`;

const containerStyle = css`
  flex-grow: 1;
`;

const invalidChars = ['-', '+', 'e'];

interface AmountInputProps {
  value: string;
  asset_id: number;
  error?: string;
  pallete?: 'purple' | 'blue';
  onChange?: (value: TransactionAmount) => void;
}

const REG_AMOUNT = /^(?!0\d)(\d+)(\.)?(\d+)?$/;

const rateStyle = css`
  position: absolute;
  top: 48px;
  left: 10px;
`;

const AmountInput: React.FC<AmountInputProps> = ({
  value, asset_id, error, pallete = 'purple', onChange,
}) => {
  const assets = useSelector(selectAssets());

  const handleInput: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    let { value: raw } = event.target;
    const val = parseFloat(raw ?? '0');
    if ((val !== 0 && raw !== '' && !REG_AMOUNT.test(raw)) || val > AMOUNT_MAX) {
      return;
    }

    if (val < AMOUNT_MIN && val !== 0) raw = convertLowAmount(AMOUNT_MIN).toString();

    onChange({ amount: raw, asset_id });
  };

  const handleSelect = (next: number) => {
    onChange({ amount: '', asset_id: next });
  };

  return (
    <ContainerStyled>
      <Input
        variant="amount"
        type="number"
        valid={!error}
        label={error}
        value={value}
        pallete={pallete}
        maxLength={16}
        placeholder="0"
        className={containerStyle}
        onInput={handleInput}
        onWheelCapture={(e) => {
          e.currentTarget.blur();
        }}
        onKeyDown={(e) => {
          if (invalidChars.includes(e.key)) {
            e.preventDefault();
          }
        }}
      />
      {asset_id === 0 && !error && <Rate value={parseFloat(value)} className={rateStyle} />}
      <Select value={asset_id} className={selectClassName} onSelect={handleSelect}>
        {assets.map(({ asset_id: id, metadata_pairs }) => (
          <Option key={id} value={id}>
            <AssetIcon asset_id={id} />
            <LabelStyled>{truncate(metadata_pairs.UN)}</LabelStyled>
          </Option>
        ))}
      </Select>
    </ContainerStyled>
  );
};

export default AmountInput;
