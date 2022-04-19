import React from 'react';
import { styled } from '@linaria/react';

import { fromGroths, getSign, toUSD } from '@core/utils';
import { useSelector } from 'react-redux';
import { selectRate } from '@app/containers/Wallet/store/selectors';

interface Props {
  value: number;
  income?: boolean;
  groths?: boolean;
  className?: string;
  txRate?: number;
}

const Ratetyled = styled.div`
  margin-top: 4px;
  color: var(--color-gray);
`;

const Rate: React.FC<Props> = ({
  value, income, groths, className, txRate,
}) => {
  const rate = useSelector(selectRate());
  const sign = income ? getSign(income) : '';
  const amount = groths ? fromGroths(value) : value;
  const usd = toUSD(amount, txRate || rate);
  return (
    <Ratetyled className={className}>
      {usd !== '< 1 cent' ? sign : ''}
      {usd}
    </Ratetyled>
  );
};

export default Rate;
