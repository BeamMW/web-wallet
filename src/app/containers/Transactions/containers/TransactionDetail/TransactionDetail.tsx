import React, { useEffect, useState } from 'react';
import { styled } from '@linaria/react';
import { useParams } from 'react-router-dom';
import { Window } from '@app/shared/components';

import { PaymentProofInformation, GeneralTransactionInformation } from '@app/containers/Transactions';
import { useDispatch, useSelector } from 'react-redux';
import { loadTransactionStatus, setPaymentProof } from '@app/containers/Transactions/store/actions';
import { selectPaymentProof, selectTransactionDetail } from '@app/containers/Transactions/store/selectors';
import { selectAssets } from '@app/containers/Wallet/store/selectors';

const TransactionTabs = styled.div`
  display: flex;
  margin: 0 -30px;
  .transaction-item {
    padding: 10px 30px;
    font-size: 14px;
    font-weight: 500;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: 3px;
    text-align: center;
    color: #fff;
    text-transform: uppercase;
    opacity: 0.5;
    cursor: pointer;
    &.active {
      opacity: 1;
      border-bottom: 3px solid #00f6d2;
    }
  }
`;

const TransactionDetailWrapper = styled.div`
  padding: 30px 0;
`;

const TransactionDetail = () => {
  const params = useParams();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('general');
  const transactionDetail = useSelector(selectTransactionDetail());
  const paymentProof = useSelector(selectPaymentProof());
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

  return (
    <Window title="Transaction Info">
      <TransactionTabs>
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
      </TransactionTabs>
      <TransactionDetailWrapper>
        {activeTab === 'general' && transactionDetail && (
          <GeneralTransactionInformation transactionDetail={transactionDetail} assets={assets} />
        )}
        {activeTab === 'payment-proof' && <PaymentProofInformation paymentProof={paymentProof} />}
      </TransactionDetailWrapper>
    </Window>
  );
};

export default TransactionDetail;
