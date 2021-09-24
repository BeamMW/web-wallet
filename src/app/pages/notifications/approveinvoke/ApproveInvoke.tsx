import React, { useState } from 'react';
import { useStore } from 'effector-react';
import { styled } from '@linaria/react';

import { Button } from 'app/uikit';
import { setView, View } from '@app/model/view';
import { $params } from './model';

import WalletController from '@app/core/WalletController';

const StyledTitle = styled.div`
  margin: 50px auto;
  font-size: 18px;
  width: 250px;
  text-align: center;
  line-break: anywhere;
`;

const ApproveInvoke = () => {
  const walletController = WalletController.getInstance();

  const params = useStore($params);
  
  return (
    <>
      <StyledTitle>{params.info}</StyledTitle>
      <StyledTitle>{params.amounts}</StyledTitle>
      <Button type="button"
          onClick={() => {
            WalletController.setNotificationApproved(params.req);
            window.close();
          }}>YES</Button>
      <Button type="button"
          onClick={() => {
            WalletController.setNotificationRejected(params.req);
            window.close();
          }}>NO</Button>
    </>
  );
};

export default ApproveInvoke;
