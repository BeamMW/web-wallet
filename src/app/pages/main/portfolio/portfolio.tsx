/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { useStore } from 'effector-react';
import { styled } from '@linaria/react';

import {
  Button, Window, Section,
} from 'app/uikit';
import { isNil } from '@core/utils';
import { setView, View, GROTHS_IN_BEAM } from '@app/model';

import ArrowUpIcon from '@icons/icon-arrow-up.svg';
import ArrowDownIcon from '@icons/icon-arrow-down.svg';

import { $balance, $transactions } from './model';

import AssetCard from './AssetCard';

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

const ListStyled = styled.ul`
  margin: 0 -12px;
`;

const Portfolio = () => {
  const [active, setActive] = useState(null);
  const balance = useStore($balance);
  const transactions = useStore($transactions);

  const toggleActive = (asset_id: number) => {
    setActive(active === asset_id ? null : asset_id);
  };

  const handleSendClick = () => {
    setView(View.SEND_FORM);
  };

  const data = isNil(active)
    ? transactions
    : transactions.filter(({ asset_id }) => asset_id === active);

  return (
    <Window title="Wallet">
      <ActionsStyled>
        <Button pallete="purple" icon={ArrowUpIcon} onClick={handleSendClick}>
          send
        </Button>
        <Button pallete="blue" icon={ArrowDownIcon} onClick={handleSendClick}>
          receive
        </Button>
      </ActionsStyled>
      <Section title="Assets">
        <ListStyled>
          {balance.map(({ asset_id, available, name }) => (
            <AssetCard
              key={asset_id}
              name={name}
              asset_id={asset_id}
              available={available}
              onClick={() => toggleActive(asset_id)}
            />
          ))}
        </ListStyled>
      </Section>
      <Section title="Transactions" />
    </Window>
  );
};

export default Portfolio;
