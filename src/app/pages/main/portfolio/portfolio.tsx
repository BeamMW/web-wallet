import React, { useState } from 'react';
import { useStore } from 'effector-react';
import { styled } from '@linaria/react';

import { $balance, $transactions } from '@state/portfolio';
import { isNil } from '@app/utils';

interface CardProps {
  active?: boolean;
}

const Card = styled.li<CardProps>`
  color: ${({ active }) => (active ? 'red' : 'black')};
`;

const GROTHS_IN_BEAM = 100000000;

const Portfolio = () => {
  const [active, setActive] = useState(null);
  const balance = useStore($balance);
  const transactions = useStore($transactions);

  const toggleActive = (asset_id: number) => {
    setActive(active === asset_id ? null : asset_id);
  };

  const list = isNil(active)
    ? transactions
    : transactions.filter(({ asset_id }) => asset_id === active);

  return (
    <div>
      <h1>Main Screen</h1>
      <ul>
        {balance.map(({ asset_id, available, name }) => (
          <Card
            key={asset_id}
            active={asset_id === active}
            onClick={() => toggleActive(asset_id)}
          >
            {asset_id} {available / GROTHS_IN_BEAM} {name}
          </Card>
        ))}
      </ul>
      <ul>
        {list.map(({ txId, asset_id, value }) => (
          <li key={txId}>
            {asset_id} {value / GROTHS_IN_BEAM}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Portfolio;
