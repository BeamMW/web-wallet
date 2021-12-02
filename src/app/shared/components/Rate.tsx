import React from 'react';
import { styled } from '@linaria/react';

import {
  fromGroths, getSign, isNil, toUSD,
} from '@core/utils';
import { useSelector } from 'react-redux';
import { selectRate } from '@app/containers/Wallet/store/selectors';

interface Props {
  value: number;
  income?: boolean;
  groths?: boolean;
  className?: string;
}

const Ratetyled = styled.div`
  margin-top: 4px;
  color: var(--color-gray);
`;

const Rate: React.FC<Props> = ({
  value, income, groths, className,
}) => {
  const rate = useSelector(selectRate());
  const sign = isNil(income) ? '' : getSign(income);
  const amount = groths ? fromGroths(value) : value;
  return (
    <Ratetyled className={className}>
      {sign}
      {toUSD(amount, rate)}
    </Ratetyled>
  );
};

export default Rate;
