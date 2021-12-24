import React from 'react';
import { useParams } from 'react-router-dom';
import { Window } from '@app/shared/components';

const TransactionDetail = () => {
  const params = useParams();
  console.log(params.id);
  return <Window title="Transactions">kek</Window>;
};

export default TransactionDetail;
