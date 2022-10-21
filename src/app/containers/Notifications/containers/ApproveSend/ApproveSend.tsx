import React from 'react';
import NotificationController from '@core/NotificationController';
import { styled } from '@linaria/react';
import { approveSendRequest, rejectSendRequest } from '@core/api';
import { Button, AssetIcon } from '@app/shared/components';
import { CancelIcon, ArrowUpIcon } from '@app/shared/icons';
import { fromGroths, compact } from '@core/utils';
import NotificationManager from '@core/NotificationManager';

const ContainerStyled = styled.div`
  position: relative;
  padding: 50px 30px;
`;

const TitleStyled = styled.div`
  text-align: center;
  font-size: 16px;
  font-weight: bold;
`;

const Receiver = styled.div`
  margin-top: 32px;
  display: flex;
  flex-direction: column;
`;

const Amounts = styled.div`
  margin-top: 2px;
`;

const Subtitle = styled.div`
  font-size: 14px;
  color: #8da1ad;
  margin-top: 4px;
  width: 130px;
  text-align: start;
`;

const LabelStyled = styled.div<{ is_spend: boolean }>`
  display: inline-block;
  vertical-align: bottom;
  line-height: 26px;
  color: ${({ is_spend }) => (is_spend ? 'var(--color-purple)' : 'var(--color-blue)')};
`;

const FeeLabelStyled = styled.div`
  display: inline-block;
  vertical-align: bottom;
  line-height: 26px;
`;

const AssetItem = styled.div`
  &:not(:first-child) {
    margin-top: 15px;
  }
`;

const Section = styled.div`
  margin-top: 15px;
  display: flex;
  flex-direction: column;
`;

const FeeValue = styled.div`
  display: flex;
  margin-top: 2px;
`;

const ControlsStyled = styled.div`
  margin-top: 30px;
`;

const ReceiverAddress = styled.div`
  margin-top: 10px;
`;

const ApproveSend = () => {
  const notification = NotificationController.getNotification();
  const notificationManager = NotificationManager.getInstance();

  const amount = fromGroths(parseInt(JSON.parse(notification.params.req).params.value, 10));
  const info = JSON.parse(notification.params.info);

  const handleCancelClick = () => {
    //rejectSendRequest(notification.params.req);
    //TODO
    notificationManager.postMessage({
      action: 'rejectSendRequest',
      params: notification.params.req
    });
    window.close();
  };

  const handleConfirmClick = () => {
    //approveSendRequest();
    //TODO
    notificationManager.postMessage({
      action: 'approveSendRequest',
      params: notification.params.req
    });
    window.close();
  };

  return (
    <>
      <ContainerStyled>
        <TitleStyled>Confirm transaction details</TitleStyled>
        <Receiver>
          <Subtitle>Recipient: </Subtitle>
          <ReceiverAddress>{compact(info.token, 16)}</ReceiverAddress>
        </Receiver>
        {/* <Section>
            <Subtitle>Transaction type: </Subtitle>
            <ReceiverAddress>
                {info.isOnline ? 'Regular' : 'Offline'}
            </ReceiverAddress>
        </Section> */}
        <Section>
          <Subtitle>Amount: </Subtitle>
          <Amounts>
            <AssetItem key={info.assetID}>
              <AssetIcon asset_id={info.assetID} />
              <LabelStyled is_spend={info.isSpend}>{amount}</LabelStyled>
            </AssetItem>
          </Amounts>
        </Section>
        <Section>
          <Subtitle>Fee: </Subtitle>
          <FeeValue>
            <AssetIcon asset_id={0} />
            <FeeLabelStyled>
              {info.fee}
              {' '}
              BEAM
              {' '}
            </FeeLabelStyled>
          </FeeValue>
        </Section>
        <ControlsStyled>
          <Button pallete={info.isSpend ? 'purple' : 'blue'} icon={ArrowUpIcon} onClick={handleConfirmClick}>
            confirm
          </Button>
          <Button variant="ghost" icon={CancelIcon} onClick={handleCancelClick}>
            cancel
          </Button>
        </ControlsStyled>
      </ContainerStyled>
    </>
  );
};

export default ApproveSend;
