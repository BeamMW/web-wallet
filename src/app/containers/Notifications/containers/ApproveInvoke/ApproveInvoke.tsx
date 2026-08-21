import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import NotificationController from '@core/NotificationController';
import { styled } from '@linaria/react';
import { Button, AssetIcon } from '@app/shared/components';
import { ArrowDownIcon, ArrowUpIcon, ArrowsTowards } from '@app/shared/icons';
import NotificationManager from '@core/NotificationManager';
import { selectAssetsInfo } from '@app/containers/Wallet/store/selectors';
import { getAssetList } from '@app/containers/Wallet/store/actions';
import { NotificationLayout } from '../../components';

const Card = styled.div`
  border: 1px solid var(--cp-line);
  clip-path: var(--cp-clip);
  overflow: hidden;
`;

const SectionLabel = styled.div`
  padding: 11px 14px 6px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--cp-muted);
`;

const AmountRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-top: 1px solid var(--cp-hair);
`;

const AmountText = styled.div<{ is_spend: boolean }>`
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 600;
  color: ${({ is_spend }) => (is_spend ? 'var(--cp-accent-2)' : 'var(--cp-accent-3)')};
`;

const FeeRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 14px;
  border-top: 1px solid var(--cp-line);
`;

const FeeLabel = styled.div`
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--cp-muted);
`;

const FeeValue = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--cp-text);
`;

const Note = styled.p`
  margin: 16px 0 0;
  text-align: center;
  font-size: 12px;
  line-height: 1.5;
  color: var(--cp-muted);
`;

const getNotificationTitle = (info, amounts) => {
  if (info.isSpend && amounts.length > 1) {
    return 'Withdraw & deposit';
  }
  if (info.isSpend && amounts.length === 1) {
    return 'Confirm deposit';
  }
  if (!info.isSpend && amounts.length === 1) {
    return 'Confirm withdraw';
  }
  return 'App transaction';
};

const getNotificationText = (info, amounts, appName) => {
  if (!info.isEnough) {
    return 'There are not enough funds to complete this transaction.';
  }
  if (info.isSpend && amounts.length > 1) {
    return `${appName} will change the balances of your wallet.`;
  }
  if (info.isSpend && amounts.length === 1) {
    return `${appName} will take funds from your wallet.`;
  }
  if (!info.isSpend && amounts.length === 1) {
    return `${appName} will send funds to your wallet.`;
  }
  return 'The transaction fee will be deducted from your balance.';
};

const getConfirmIcon = (info, amounts) => {
  if (info.isSpend && amounts.length > 1) {
    return ArrowsTowards;
  }
  if (info.isSpend && amounts.length === 1) {
    return ArrowUpIcon;
  }
  return ArrowDownIcon;
};

const ApproveInvoke = () => {
  const notification = NotificationController.getNotification();
  const notificationManager = NotificationManager.getInstance();
  const dispatch = useDispatch();
  // Assets are no longer piggy-backed on the notification (the engine has no UI
  // store); source them from this window's own store, loading if needed.
  const storeAssets = useSelector(selectAssetsInfo());
  const assets = notification.params.assets?.length ? notification.params.assets : storeAssets;

  useEffect(() => {
    if (!storeAssets?.length) {
      dispatch(getAssetList.request({ refresh: false }));
    }
  }, [dispatch, storeAssets]);

  let amounts: any[] = [];
  let info: any = {};
  try {
    amounts = JSON.parse(notification.params.amounts);
    info = JSON.parse(notification.params.info);
  } catch {
    return (
      <NotificationLayout
        title="Error"
        actions={(
          <Button type="button" variant="ghost" pallete="purple" onClick={() => window.close()}>
            Close
          </Button>
        )}
      >
        <Note>Invalid notification data. Please close this window and try again.</Note>
      </NotificationLayout>
    );
  }

  const text = getNotificationText(info, amounts, notification.params.appname);
  const title = getNotificationTitle(info, amounts);

  const handleCancelClick = () => {
    notificationManager.postMessage({
      action: 'rejectContractInfoRequest',
      params: notification.params.req,
    });
    window.close();
  };

  const handleConfirmClick = () => {
    notificationManager.postMessage({
      action: 'approveContractInfoRequest',
      params: notification.params.req,
    });
    window.close();
  };

  return (
    <NotificationLayout
      title={title}
      appname={notification.params.appname}
      accent={info.isSpend ? 'purple' : 'blue'}
      actions={(
        <>
          <Button type="button" variant="ghost" pallete="purple" onClick={handleCancelClick}>
            Cancel
          </Button>
          <Button
            type="button"
            pallete={info.isSpend ? 'purple' : 'blue'}
            icon={getConfirmIcon(info, amounts)}
            onClick={handleConfirmClick}
          >
            Confirm
          </Button>
        </>
      )}
    >
      <Card>
        <SectionLabel>Amounts</SectionLabel>
        {amounts.length > 0 ? (
          amounts.map((data) => {
            const assetItem = assets?.find((asset) => asset.asset_id === data.assetID);
            const name = assetItem?.metadata_pairs?.UN ?? (data.assetID === 0 ? 'BEAM' : '');
            return (
              <AmountRow key={data.assetID}>
                <AssetIcon asset_id={data.assetID} className="without-transform" />
                <AmountText is_spend={data.spend}>
                  {`${data.spend ? '-' : '+'} ${data.amount} ${name} (${data.assetID})`}
                </AmountText>
              </AmountRow>
            );
          })
        ) : (
          <AmountRow>
            <AmountText is_spend={false}>—</AmountText>
          </AmountRow>
        )}
        <FeeRow>
          <FeeLabel>Network fee</FeeLabel>
          <FeeValue>
            <AssetIcon asset_id={0} className="without-transform" />
            {`${info.fee} BEAM`}
          </FeeValue>
        </FeeRow>
      </Card>
      <Note>{text}</Note>
    </NotificationLayout>
  );
};

export default ApproveInvoke;
