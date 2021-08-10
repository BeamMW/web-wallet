import React, { useState } from 'react';
import { useStore } from 'effector-react';
import { styled } from '@linaria/react';

import { $balance, $transactions } from '@state/portfolio';
import { Table } from '@pages/shared';
import { isNil } from '@app/utils';

interface CardProps {
  active?: boolean;
}

function compact(value: string): string {
  if (value.length <= 11) {
    return value;
  }
  return `${value.substr(0, 5)}…${value.substr(-5, 5)}`;
}

const GROTHS_IN_BEAM = 100000000;

const TABLE_CONFIG = [
  {
    name: 'create_time',
    title: 'Created',
  },
  {
    name: 'sender',
    title: 'From',
    fn: compact,
  },
  {
    name: 'receiver',
    title: 'To',
    fn: compact,
  },
  {
    name: 'value',
    title: 'Amount',
    fn: (value: number) => {
      const result = value / GROTHS_IN_BEAM;
      return result.toString();
    },
  },
  {
    name: 'status_string',
    title: 'Status',
  },
];

const Card = styled.li<CardProps>`
  color: ${({ active }) => (active ? 'red' : 'black')};
`;

const Portfolio = () => {
  const [active, setActive] = useState(null);
  const balance = useStore($balance);
  const transactions = useStore($transactions);

  const toggleActive = (asset_id: number) => {
    setActive(active === asset_id ? null : asset_id);
  };

  const data = isNil(active)
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
      <Table key="txId" data={data} config={TABLE_CONFIG} />
    </div>
  );
};

export default Portfolio;
