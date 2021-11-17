import React from 'react';

import { Window } from 'app/shared/components';
import { ROUTES } from '@app/shared/constants';
import { useNavigate } from 'react-router-dom';

const TransactionInfo = () => {
  const navigate = useNavigate();
  const handlePrevious: React.MouseEventHandler = () => {
    navigate(ROUTES.SETTINGS.BASE);
  };

  return <Window title="Transaction info" onPrevious={handlePrevious} />;
};

export default TransactionInfo;
