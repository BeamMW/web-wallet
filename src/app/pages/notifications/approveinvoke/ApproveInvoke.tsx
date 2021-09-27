import React from 'react';
import NotificationController from '@core/NotificationController';
import { styled } from '@linaria/react';
import { approveContractInfoRequest, rejectContractInfoRequest } from '@core/api';
import { Button } from 'app/uikit';

const StyledTitle = styled.div`
  margin: 50px auto;
  font-size: 18px;
  width: 250px;
  text-align: center;
  line-break: anywhere;
`;

const ApproveInvoke = () => {
  const notification = NotificationController.getNotification();

  return (
    <>
      <StyledTitle>{notification.params.info}</StyledTitle>
      <StyledTitle>{notification.params.amounts}</StyledTitle>
      <Button
        type="button"
        onClick={
          () => {
            approveContractInfoRequest(notification.params.req);
            window.close();
          }
        }
      >
        YES
      </Button>
      <Button
        type="button"
        onClick={
          () => {
            rejectContractInfoRequest(notification.params.req);
            window.close();
          }
        }
      >
        NO
      </Button>
    </>
  );
};

export default ApproveInvoke;
