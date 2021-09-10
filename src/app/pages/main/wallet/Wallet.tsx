/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useStore } from 'effector-react';
import { styled } from '@linaria/react';

import {
  Button, Window, Section, Menu,
} from 'app/uikit';
import { isNil } from '@core/utils';
import { gotoSend, gotoReceive } from '@app/model/view';
import { getRateFx, GROTHS_IN_BEAM } from '@app/model/rates';

import ArrowUpIcon from '@icons/icon-arrow-up.svg';
import ArrowDownIcon from '@icons/icon-arrow-down.svg';
import MenuIcon from '@icons/icon-menu.svg';

import { css } from '@linaria/core';
import { $totals, $transactions } from './model';

import Assets from './Assets';
import Transactions from './Transactions';

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
    margin: 0 4px !important;
  }
`;

const menuButtonStyle = css`
  position: fixed;
  z-index: 3;
  top: 74px;
  left: 24px;
`;

const Wallet = () => {
  useEffect(() => {
    getRateFx();
  }, []);

  const [menuVisible, setVisible] = useState(false);
  const [active, setActive] = useState(null);
  const totals = useStore($totals);
  const transactions = useStore($transactions);

  const toggleActive = (asset_id: number) => {
    setActive(active === asset_id ? null : asset_id);
  };

  const handleMenuClick: React.MouseEventHandler = () => setVisible(true);

  const handleCancelClick: React.MouseEventHandler = () => setVisible(false);

  const data = isNil(active)
    ? transactions
    : transactions.filter(({ asset_id }) => asset_id === active);

  return (
    <Window title="Wallet">
      <Button variant="icon" icon={MenuIcon} className={menuButtonStyle} onClick={handleMenuClick} />
      { menuVisible && <Menu onCancel={handleCancelClick} />}
      <ActionsStyled>
        <Button pallete="purple" icon={ArrowUpIcon} onClick={gotoSend}>
          send
        </Button>
        <Button pallete="blue" icon={ArrowDownIcon} onClick={gotoReceive}>
          receive
        </Button>
      </ActionsStyled>
      <Section title="Assets">
        <Assets data={totals} />
      </Section>
      <Section title="Transactions">
        <Transactions data={transactions} />
      </Section>
    </Window>
  );
};

export default Wallet;
