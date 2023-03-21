import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { useParams } from 'react-router-dom';
import { Window } from '@app/shared/components';

import { PaymentProofInformation, GeneralTransactionInformation } from '@app/containers/Transactions';
import { useDispatch, useSelector } from 'react-redux';
import { loadTransactionStatus, setPaymentProof } from '@app/containers/Transactions/store/actions';
import { selectPaymentProof, selectTransactionDetail } from '@app/containers/Transactions/store/selectors';
import { selectAssets } from '@app/containers/Wallet/store/selectors';
import { selectIsBalanceHidden } from '@app/shared/store/selectors';
import { toast } from 'react-toastify';
import { copyToClipboard } from '@core/utils';
import { DetailInfoWrapper, DetailTabs } from '@app/shared/components/DetailInformationLayout';

const TransactionDetail = () => {
  const params = useParams();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('general');
  const transactionDetail = useSelector(selectTransactionDetail());
  const paymentProof = useSelector(selectPaymentProof());
  const isBalanceHidden = useSelector(selectIsBalanceHidden());
  //  const rate = useSelector(selectRate());
  const assets = useSelector(selectAssets());

  useEffect(() => {
    dispatch(loadTransactionStatus.request(params.id));
    return () => {
      dispatch(loadTransactionStatus.success(null));
      dispatch(setPaymentProof(null));
    };
  }, [dispatch, params.id]);

  const handleButton = (e: { keyCode: number }) => {
    if (e.keyCode === 9) {
      if (activeTab === 'general' && paymentProof) {
        setActiveTab('payment-proof');
      } else {
        setActiveTab('general');
      }
    }
  };

  const copy = useCallback((value, tM) => {
    toast(tM);
    copyToClipboard(value);
  }, []);

  const assetRate = useMemo(() => {
    if (!transactionDetail) return null;
    let rate = transactionDetail?.rates.find((a) => a.from === transactionDetail.asset_id && a.to === 'usd');

    if (!rate && transactionDetail.invoke_data?.length && transactionDetail.invoke_data[0].amounts.length === 1) {
      rate = transactionDetail?.rates.find(
        (a) => a.from === transactionDetail.invoke_data[0].amounts[0].asset_id && a.to === 'usd',
      );
    }

    return rate;
  }, [transactionDetail]);

  const feeRate = useMemo(() => {
    if (!transactionDetail) return null;
    const rate = transactionDetail?.rates.find((a) => a.from === 0 && a.to === 'usd');

    return rate;
  }, [transactionDetail]);

  return (
    <Window title="Transaction Info">
      {!transactionDetail?.invoke_data?.length && !transactionDetail?.income && (
        <DetailTabs>
          <div
            role="link"
            className={`transaction-item ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
            onKeyDown={handleButton}
            tabIndex={0}
          >
            General
          </div>
          {paymentProof && (
            <div
              role="link"
              className={`transaction-item ${activeTab === 'payment-proof' ? 'active' : ''}`}
              onClick={() => setActiveTab('payment-proof')}
              onKeyDown={handleButton}
              tabIndex={-1}
            >
              Payment proof
            </div>
          )}
        </DetailTabs>
      )}
      <DetailInfoWrapper>
        {activeTab === 'general' && transactionDetail && (
          <GeneralTransactionInformation
            transactionDetail={transactionDetail}
            assets={assets}
            isBalanceHidden={isBalanceHidden}
            copy={copy}
            assetRate={assetRate}
            feeRate={feeRate}
          />
        )}
        {activeTab === 'payment-proof' && (
          <PaymentProofInformation
            transactionDetail={transactionDetail}
            paymentProof={paymentProof}
            isBalanceHidden={isBalanceHidden}
            copy={copy}
            assetRate={assetRate}
          />
        )}
      </DetailInfoWrapper>
    </Window>
  );
};

export default TransactionDetail;
