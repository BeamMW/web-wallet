import React from 'react';
import { useStore } from 'effector-react';
import { styled } from '@linaria/react';

import { getSign, isNil, toUSD } from '@app/core/utils';
import { $rate } from '@app/model/rates';

interface Props {
  value: number;
  income?: boolean;
  className?: string;
}

const Ratetyled = styled.div`
  margin-top: 4px;
  color: var(--color-gray);
`;

const Rate: React.FC<Props> = ({ value, income, className }) => {
  const rate = useStore($rate);
  const sign = isNil(income) ? '' : getSign(income);
  return (
    <Ratetyled className={className}>
      {sign}
      { toUSD(value, rate) }
    </Ratetyled>
  );
};

export default Rate;
