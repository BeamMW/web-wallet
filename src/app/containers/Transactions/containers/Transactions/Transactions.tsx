import React, { useCallback } from 'react';
import { Window } from '@app/shared/components';
import { TransactionList } from '@app/containers/Transactions';
import { useSelector } from 'react-redux';

import { createdComparator } from '@core/utils';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@app/shared/constants';
import { selectTransactions } from '@app/containers/Transactions/store/selectors';

const Transactions = () => {
  const navigate = useNavigate();
  const transactions = useSelector(selectTransactions());
  const sorted = transactions.slice().sort(createdComparator);

  const navigateToWallet = useCallback(() => {
    navigate(ROUTES.WALLET.BASE);
  }, [navigate]);

  return (
    <Window title="Transactions" onPrevious={navigateToWallet}>
      <TransactionList data={sorted} />
    </Window>
  );
};

export default Transactions;
