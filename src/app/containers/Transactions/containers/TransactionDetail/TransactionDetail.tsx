import React, { useCallback, useEffect, useState } from 'react';
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

  return (
    <Window title="Transaction Info">
      {!transactionDetail?.invoke_data?.length && (
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
          />
        )}
        {activeTab === 'payment-proof' && (
          <PaymentProofInformation paymentProof={paymentProof} isBalanceHidden={isBalanceHidden} copy={copy} />
        )}
      </DetailInfoWrapper>
    </Window>
  );
};

export default TransactionDetail;
