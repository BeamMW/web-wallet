import React, { useState } from 'react';

import { Button, Window } from 'app/uikit';
import { useStore } from 'effector-react';
import { styled } from '@linaria/react';
import {history} from "@app/shared/history";
import {ROUTES} from "@app/shared/constants";
import {useNavigate} from "react-router-dom";

const TransactionInfo = () => {
  const navigate =useNavigate();
  const handlePrevious: React.MouseEventHandler = () => {
    navigate(ROUTES.SETTINGS.BASE)
  };
      
  return (
    <Window title="Transaction info" onPrevious={handlePrevious}>
     
      
    </Window>
  );
};

export default TransactionInfo;
