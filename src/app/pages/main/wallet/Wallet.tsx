/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useStore } from 'effector-react';
import { styled } from '@linaria/react';

import {
  Button, Window, Section, Menu,
} from 'app/uikit';
import { compact, isNil } from '@core/utils';
import { gotoSend, gotoReceive } from '@app/model/view';
import { getRateFx, GROTHS_IN_BEAM } from '@app/model/rates';

import ArrowUpIcon from '@icons/icon-arrow-up.svg';
import ArrowDownIcon from '@icons/icon-arrow-down.svg';
import MenuIcon from '@icons/icon-menu.svg';

import { css } from '@linaria/core';
import { $assets, $transactions } from '@app/model/wallet';

import Assets from './Assets';
import Transactions from './Transactions';

const TXS_MAX = 4;

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
  margin: 10px -4px 0;

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
  const assets = useStore($assets);
  const transactions = useStore($transactions);

  const toggleActive = (asset_id: number) => {
    setActive(active === asset_id ? null : asset_id);
  };

  const handleMenuClick: React.MouseEventHandler = () => setVisible(true);

  const handleCancelClick: React.MouseEventHandler = () => setVisible(false);

  const sliced = transactions.slice(0, TXS_MAX);
  const filtered = isNil(active) ? sliced : sliced.filter(({ asset_id }) => asset_id === active);

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
        <Assets data={assets} />
      </Section>
      <Section title="Transactions">
        <Transactions data={filtered} />
      </Section>
    </Window>
  );
};

export default Wallet;
