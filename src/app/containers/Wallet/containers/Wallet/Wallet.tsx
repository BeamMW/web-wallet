/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect } from 'react';
import { styled } from '@linaria/react';

import {
  Button, Window, Section, Menu,
} from '@app/shared/components';

import { ArrowUpIcon, ArrowDownIcon } from '@app/shared/icons';

import { css } from '@linaria/core';

import { Transaction } from '@core/types';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@app/shared/constants';
import { useDispatch, useSelector } from 'react-redux';
import { selectAssets, selectRate, selectTransactions } from '@app/containers/Wallet/store/selectors';
import { GROTHS_IN_BEAM } from '@app/containers/Wallet/constants';
import { loadRate } from '@app/containers/Wallet/store/actions';
import { Assets, Transactions } from '../../components/Wallet';

const TXS_MAX = 4;

const ActionsStyled = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 10px -14px 0;

  > button {
    margin: 0 4px !important;
  }
`;

function createdComparator({ create_time: a }: Transaction, { create_time: b }: Transaction): -1 | 0 | 1 {
  if (a === b) {
    return 0;
  }

  return a < b ? 1 : -1;
}

const Wallet = () => {
  const dispatch = useDispatch();

  const assets = useSelector(selectAssets());
  const transactions = useSelector(selectTransactions());
  const rate = useSelector(selectRate());

  useEffect(() => {
    if (!rate) {
      dispatch(loadRate.request());
    }
  }, [dispatch, rate]);

  const navigate = useNavigate();

  const sorted = transactions.slice().sort(createdComparator);
  const sliced = sorted.slice(0, TXS_MAX);

  return (
    <Window title="Wallet" primary>
      <ActionsStyled>
        <Button pallete="purple" icon={ArrowUpIcon} onClick={() => navigate(ROUTES.WALLET.SEND)}>
          send
        </Button>
        <Button pallete="blue" icon={ArrowDownIcon} onClick={() => navigate(ROUTES.WALLET.RECEIVE)}>
          receive
        </Button>
      </ActionsStyled>
      <Section title="Assets">
        <Assets data={assets} />
      </Section>

      <Section title="Transactions" showAllAction={sliced.length > TXS_MAX ? () => {} : undefined}>
        <Transactions data={sliced} />
      </Section>
    </Window>
  );
};

export default Wallet;
