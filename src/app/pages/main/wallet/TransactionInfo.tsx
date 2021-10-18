import React, { useState } from 'react';

import { Button, Window } from 'app/uikit';
import { View, setView } from '@app/model/view';
import { useStore } from 'effector-react';
import { styled } from '@linaria/react';


const TransactionInfo = () => {
  const handlePrevious: React.MouseEventHandler = () => {
    setView(View.SETTINGS);
  };
      
  return (
    <Window title="Transaction info" onPrevious={handlePrevious}>
     
      
    </Window>
  );
};

export default TransactionInfo;
