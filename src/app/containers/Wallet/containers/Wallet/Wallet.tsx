/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useEffect } from 'react';
import { styled } from '@linaria/react';

import { Button, Window, Section } from '@app/shared/components';

import { ArrowUpIcon, ArrowDownIcon } from '@app/shared/icons';

import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@app/shared/constants';
import { useDispatch, useSelector } from 'react-redux';
import { selectAssets, selectRate, selectTransactions } from '@app/containers/Wallet/store/selectors';

import { loadRate } from '@app/containers/Wallet/store/actions';
import { TransactionList } from '@app/containers/Transactions';
import { createdComparator } from '@core/utils';
import { Assets } from '../../components/Wallet';

const TXS_MAX = 4;

const ActionsStyled = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 10px -14px 0;

  > button {
    margin: 0 4px !important;
  }
`;

const Wallet = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const assets = useSelector(selectAssets());
  const transactions = useSelector(selectTransactions());
  const rate = useSelector(selectRate());

  useEffect(() => {
    if (!rate) {
      dispatch(loadRate.request());
    }
  }, [dispatch, rate]);

  const sorted = transactions.slice().sort(createdComparator);
  const sliced = sorted.slice(0, TXS_MAX);

  const navigateToTransactions = useCallback(() => {
    navigate(ROUTES.TRANSACTIONS.BASE);
  }, [navigate]);

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

      <Section title="Transactions" showAllAction={sorted.length > TXS_MAX ? navigateToTransactions : undefined}>
        <TransactionList data={sliced} />
      </Section>
    </Window>
  );
};

export default Wallet;
