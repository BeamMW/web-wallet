import React from 'react';
import NotificationController from '@core/NotificationController';
import { styled } from '@linaria/react';
import { approveContractInfoRequest, rejectContractInfoRequest } from '@core/api';
import { Button } from 'app/uikit';
import { useStore } from 'effector-react';
import { $assets } from '@app/model/wallet';
import { AssetIcon } from '@app/uikit';
import {
  CancelIcon, ArrowDownIcon, ArrowUpIcon, ArrowsTowards
} from '@app/icons';

const ContainerStyled = styled.div`
  position: relative;
  padding: 50px 30px;
`;

const TitleStyled = styled.div`
  text-align: center;
  font-size: 16px;
  font-weight: bold;
`;

const TextStyled = styled.div`
  text-align: center;
  margin-top: 30px;
  font-style: italic;
  color: rgba(255, 255, 255, .7);
`;

const Amount = styled.div`
  margin-top: 32px;
  display: flex;
  flex-direction: column;
`;

const Amounts = styled.div`
  margin-top: 2px;
`;

const AmountSubtitle = styled.div`
  font-size: 14px;
  color: #8da1ad;
  margin-top: 4px;
  width: 55px;
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

const Fee = styled.div`
  margin-top: 15px;
  display: flex;
  flex-direction: column;
`;

const FeeSubtitle = styled.div`
  font-size: 14px;
  color: #8da1ad;
  margin-top: 4px;
  width: 55px;
  text-align: start;
`;

const FeeValue = styled.div`
  display: flex;
  margin-top: 2px;
`;

const ControlsStyled = styled.div`
  margin-top: 30px;
`;

const getNotificationTitle = (info, amounts) => {
    if (info.isSpend && amounts.length > 1) {
        return 'Confirm withdraw & deposit';
    }
    if (info.isSpend && amounts.length === 1) {
        return 'Confirm deposit from the wallet';
    }
    if (!info.isSpend && amounts.length === 1) {
        return 'Confirm withdraw to the wallet';
    }
    return "Confirm application transaction";
}

const getNotificationText = (info, amounts, appName) => {
  if (!info.isEnough) { 
    return 'There is not enough funds to complete the transaction';
  }

  if (info.isSpend && amounts.length > 1) {
      return `${appName} will change the balances of your wallet`;
  }

  if (info.isSpend && amounts.length === 1) {
      return `${appName} will take the funds from your wallet`;
  }

  if (!info.isSpend && amounts.length === 1) {
      return `${appName} will send the funds to your wallet`;
  }

  return 'The transaction fee would be deducted from your balance';
}

const getConfirmIcon = (info, amounts) => {
  if (info.isSpend && amounts.length > 1) {
    return ArrowsTowards;
  }
  if (info.isSpend && amounts.length === 1) {
      return ArrowUpIcon;
  }
  if (!info.isSpend && amounts.length === 1) {
      return ArrowDownIcon;
  }
  return ArrowDownIcon;
}

const ApproveInvoke = () => {
  const notification = NotificationController.getNotification();

  const amounts = JSON.parse(notification.params.amounts);
  const info = JSON.parse(notification.params.info);

  console.log(amounts, info)
  
  const assets = useStore($assets);
  const text = getNotificationText(info, amounts, notification.params.appname);
  const title = getNotificationTitle(info, amounts);

  const handleCancelClick = () => {
    rejectContractInfoRequest(notification.params.req);
    window.close();
  };
  
  const handleConfirmClick = () => {
    approveContractInfoRequest(notification.params.req);
    window.close();
  }

  return (
    <>
      <ContainerStyled>
        <TitleStyled>{title}</TitleStyled>
        <Amount>
          <AmountSubtitle>Amount: </AmountSubtitle>
          <Amounts>
            { amounts.length > 0 ? (
                amounts.map((data) => {
                  console.log('aaa:', assets)
                  const assetItem = assets.find((asset) => asset.asset_id === data.assetID);
                  if (assetItem) {
                  return (
                    <AssetItem key={data.assetID}>
                      <AssetIcon asset_id={data.assetID} />
                      <LabelStyled is_spend={data.spend}>
                        { data.spend ? '-' : '+' }  {data.amount} {assetItem.metadata_pairs.UN}
                      </LabelStyled>
                    </AssetItem>
                  )}
                })
              ) : '-' }
          </Amounts>
        </Amount>
        <Fee>
          <FeeSubtitle>Fee: </FeeSubtitle>
          <FeeValue>
            <AssetIcon asset_id={0} />
            <FeeLabelStyled>{info.fee} BEAM </FeeLabelStyled>
          </FeeValue>
        </Fee>
        <TextStyled>{text}</TextStyled>
        <ControlsStyled>
          <Button 
              pallete={info.isSpend ? 'purple' : 'blue'}
              icon={getConfirmIcon(info, amounts)}
              onClick={handleConfirmClick}>
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

export default ApproveInvoke;