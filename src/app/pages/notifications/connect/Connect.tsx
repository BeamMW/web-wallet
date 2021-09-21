import React, { useState } from 'react';
import { useStore } from 'effector-react';
import { styled } from '@linaria/react';

import { Button } from 'app/uikit';
import { $name } from './model';

import WalletController from '@app/core/WalletController';

const StyledTitle = styled.div`
  margin: 50px auto;
  font-size: 18px;
  width: 250px;
  text-align: center;
`;

const walletController = WalletController.getInstance();

const Connect = () => {
  const dappname = useStore($name);

  return (
    <>
      <StyledTitle> APROVE CONNECT FROM "{dappname}" ?</StyledTitle>
      <Button type="button"
          onClick={ async () => {
            const res = await walletController.approveConnection(true);
            if (res) {
              window.close();
            }
          }}>YES</Button>
      <Button type="button"
          onClick={() => {
            window.close();
          }}>NO</Button>
    </>
  );
};

export default Connect;
