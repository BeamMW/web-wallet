import React, { useState } from 'react';
import { useStore } from 'effector-react';
import { styled } from '@linaria/react';

import { $balance, $transactions } from '@state/portfolio';
import { Button, Table, Window, Section } from '@pages/shared';
import { isNil } from '@core/utils';
import { setView, View, GROTHS_IN_BEAM } from '@state/shared';

import ArrowUpIcon from '@icons/icon-arrow-up.svg';
import ArrowDownIcon from '@icons/icon-arrow-down.svg';

import AssetCard from './asset-card';

function compact(value: string): string {
  if (value.length <= 11) {
    return value;
  }
  return `${value.substr(0, 5)}…${value.substr(-5, 5)}`;
}

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

const ActionsStyled = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 0 -4px;

  > button {
    margin: 0 4px;
  }
`;

const Portfolio = () => {
  const [active, setActive] = useState(null);
  const balance = useStore($balance);
  const transactions = useStore($transactions);

  const toggleActive = (asset_id: number) => {
    setActive(active === asset_id ? null : asset_id);
  };

  const handleSendClick = () => {
    setView(View.SEND);
  };

  const data = isNil(active)
    ? transactions
    : transactions.filter(({ asset_id }) => asset_id === active);

  return (
    <Window title="Wallet">
      <ActionsStyled>
        <Button color="purple" icon={ArrowUpIcon} onClick={handleSendClick}>
          send
        </Button>
        <Button color="blue" icon={ArrowDownIcon} onClick={handleSendClick}>
          receive
        </Button>
      </ActionsStyled>
      <Section title="Assets">
        <ul>
          {balance.map(({ asset_id, ...rest }) => (
            <AssetCard
              key={asset_id}
              asset_id={asset_id}
              onClick={() => toggleActive(asset_id)}
              {...rest}
            />
          ))}
        </ul>
      </Section>
      <Section title="Transactions"></Section>
    </Window>
  );
};

export default Portfolio;
