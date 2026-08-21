import React, { useEffect, useRef } from 'react';
import { styled } from '@linaria/react';
import NotificationController from '@core/NotificationController';
import NotificationManager from '@core/NotificationManager';

import { Button } from '@app/shared/components';
import { NotificationLayout } from '../../components';

const Prompt = styled.div`
  text-align: center;
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--cp-accent);
`;

const Note = styled.p`
  margin: 0 0 18px;
  text-align: center;
  font-size: 13px;
  line-height: 1.5;
  color: var(--cp-muted);
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
    <NotificationLayout
      title="Connection request"
      appname={notification.params.appname}
      appurl={notification.params.appurl}
      actions={(
        <>
          <Button
            type="button"
            variant="ghost"
            pallete="purple"
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
        </>
      )}
    >
      <Note>
        This app wants to connect to your Beam wallet. It will be able to request your address and ask you to approve
        transactions.
      </Note>
      <Prompt>Approve connection?</Prompt>
    </NotificationLayout>
  );
};

export default Connect;
