import React from 'react';
import NotificationController from '@core/NotificationController';
import { styled } from '@linaria/react';

import { Button, AssetIcon } from '@app/shared/components';
import { fromGroths, compact } from '@core/utils';
import NotificationManager from '@core/NotificationManager';
import { NotificationLayout } from '../../components';

const Card = styled.div`
  border: 1px solid var(--cp-line);
  clip-path: var(--cp-clip);
  overflow: hidden;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 13px 14px;
  border-bottom: 1px solid var(--cp-hair);

  &:last-child {
    border-bottom: none;
  }
`;

const Label = styled.div`
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--cp-muted);
  white-space: nowrap;
`;

const Value = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--cp-text);
  text-align: right;
  word-break: break-all;
`;

const Amount = styled.div<{ is_spend: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 15px;
  font-weight: 600;
  color: ${({ is_spend }) => (is_spend ? 'var(--cp-accent-2)' : 'var(--cp-accent-3)')};
`;

const ApproveSend = () => {
  const notification = NotificationController.getNotification();
  const notificationManager = NotificationManager.getInstance();

  const amount = fromGroths(parseInt(JSON.parse(notification.params.req).params.value, 10));
  const info = JSON.parse(notification.params.info);

  const handleCancelClick = () => {
    notificationManager.postMessage({
      action: 'rejectSendRequest',
      params: notification.params.req,
    });
    window.close();
  };

  const handleConfirmClick = () => {
    notificationManager.postMessage({
      action: 'approveSendRequest',
      params: notification.params.req,
    });
    window.close();
  };

  return (
    <NotificationLayout
      title="Confirm transaction"
      appname={notification.params.appname}
      accent={info.isSpend ? 'purple' : 'blue'}
      actions={(
        <>
          <Button type="button" variant="ghost" pallete="purple" onClick={handleCancelClick}>
            Cancel
          </Button>
          <Button type="button" pallete={info.isSpend ? 'purple' : 'blue'} onClick={handleConfirmClick}>
            Confirm
          </Button>
        </>
      )}
    >
      <Card>
        <Row>
          <Label>Recipient</Label>
          <Value>{compact(info.token, 16)}</Value>
        </Row>
        <Row>
          <Label>Amount</Label>
          <Amount is_spend={info.isSpend}>
            <AssetIcon asset_id={info.assetID} className="without-transform" />
            {`${info.isSpend ? '-' : '+'} ${amount}`}
          </Amount>
        </Row>
        <Row>
          <Label>Network fee</Label>
          <Value>
            <AssetIcon asset_id={0} className="without-transform" />
            {`${info.fee} BEAM`}
          </Value>
        </Row>
      </Card>
    </NotificationLayout>
  );
};

export default ApproveSend;
