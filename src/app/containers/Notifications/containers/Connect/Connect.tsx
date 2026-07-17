import React, { useEffect, useRef } from 'react';
import { styled } from '@linaria/react';
import NotificationController from '@core/NotificationController';
import NotificationManager from '@core/NotificationManager';

import { Button } from '@app/shared/components';

const StyledTitle = styled.div`
  margin: 50px auto;
  font-size: 18px;
  width: 250px;
  text-align: center;
`;

const StyledMessage = styled.div`
  margin: 0 20px 20px 20px;
  font-size: 16px;
  text-align: center;
`;

const StyledApprove = styled.div`
  margin: 0 20px 30px 20px;
  text-align: center;
  font-size: 16px;
`;

const StyledOrigin = styled.div`
  margin-top: 10px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  word-break: break-all;
`;

const Connect = () => {
  const notification = NotificationController.getNotification();

  const notificationManager = NotificationManager.getInstance();

  // Guards the beforeunload fallback so it doesn't send a second (reject) message
  // after the user already explicitly approved/rejected and we called window.close().
  const actedRef = useRef(false);

  useEffect(() => {
    const handler = () => {
      if (actedRef.current) return;
      notificationManager.postMessage({
        action: 'connect_rejected',
        params: { appurl: notification.params.appurl },
      });
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [notificationManager, notification.params.appurl]);

  return (
    <>
      <StyledTitle>DApp Connection Request</StyledTitle>
      <StyledMessage>
        <b>
          {notification.params.appname}
          {' '}
        </b>
        is trying to connect
        <br />
        to the BEAM Web Wallet.
        {notification.params.appurl && (
          <StyledOrigin>
            Origin:
            {notification.params.appurl}
          </StyledOrigin>
        )}
      </StyledMessage>
      <StyledApprove>Approve connection?</StyledApprove>
      <Button
        type="button"
        onClick={() => {
          actedRef.current = true;
          notificationManager.postMessage({
            action: 'connect',
            params: {
              apiver: notification.params.apiver,
              apivermin: notification.params.apivermin,
              appname: notification.params.appname,
              appurl: notification.params.appurl,
            },
          });
          window.close();
        }}
      >
        Approve
      </Button>
      <Button
        type="button"
        onClick={() => {
          actedRef.current = true;
          notificationManager.postMessage({
            action: 'connect_rejected',
            params: { appurl: notification.params.appurl },
          });
          window.close();
        }}
      >
        Reject
      </Button>
    </>
  );
};

export default Connect;
