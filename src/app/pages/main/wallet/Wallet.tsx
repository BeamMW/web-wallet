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

import {
  ArrowUpIcon,
  ArrowDownIcon,
} from '@app/icons';

import { css } from '@linaria/core';
import { $assets, $transactions } from '@app/model/wallet';

import { Transaction } from '@app/core/types';
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
  margin: 10px -14px 0;

  > button {
    margin: 0 4px !important;
  }
`;

const menuButtonStyle = css`
  position: fixed;
  z-index: 3;
  top: 74px;
  left: 24px;
  margin: 0;
`;

function createdCompartor(
  { create_time: a }: Transaction,
  { create_time: b }: Transaction,
): -1 | 0 | 1 {
  if (a === b) {
    return 0;
  }

  return a < b ? 1 : -1;
}

const Wallet = () => {
  useEffect(() => {
    getRateFx();
  }, []);

  const [active, setActive] = useState(null);
  const assets = useStore($assets);
  const transactions = useStore($transactions);

  const toggleActive = (asset_id: number) => {
    setActive(active === asset_id ? null : asset_id);
  };

  const filtered = isNil(active)
    ? transactions : transactions.filter(({ asset_id }) => asset_id === active);
  const sorted = filtered.sort(createdCompartor);
  const sliced = sorted.slice(0, TXS_MAX);

  return (
    <Window title="Wallet" primary>
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
        <Transactions data={sliced} />
      </Section>
    </Window>
  );
};

export default Wallet;
