import React from 'react';
import { styled } from '@linaria/react';
import { TxEmptyState } from '@app/shared/icons';

const EmptyStateWrapper = styled.div`
  text-align: center;
  padding: 50px 0;
  flex-direction: row;
  > svg {
    margin: 0 auto;
    text-align: center;
  }
`;
const EmptyListTitle = styled.div`
  font-size: 14px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.43;
  letter-spacing: normal;
  text-align: center;
  color: #fff;
  opacity: 0.5;
  margin-top: 20px;
`;

const EmptyTransaction = () => (
  <EmptyStateWrapper>
    <TxEmptyState />
    <EmptyListTitle>Your transaction list is empty</EmptyListTitle>
  </EmptyStateWrapper>
);

export default EmptyTransaction;
