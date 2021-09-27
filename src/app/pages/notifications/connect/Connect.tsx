import React from 'react';
import { styled } from '@linaria/react';
import NotificationController from '@core/NotificationController';
import { approveConnection } from '@core/api';

import { Button } from 'app/uikit';

const StyledTitle = styled.div`
  margin: 50px auto;
  font-size: 18px;
  width: 250px;
  text-align: center;
`;

const Connect = () => {
  const notification = NotificationController.getNotification();

  return (
    <>
      <StyledTitle>DApp Connection Request</StyledTitle>
      <div>
        {notification.params.name}
        is trying to connect to the BEAM Web Wallet.
      </div>
      <div>Approve connection?</div>
      <Button
        type="button"
        onClick={
          async () => {
            await approveConnection();
            window.close();
          }
        }
      >
        Approve
      </Button>
      <Button
        type="button"
        onClick={
          () => {
            window.close();
          }
        }
      >
        Reject
      </Button>
    </>
  );
};

export default Connect;
