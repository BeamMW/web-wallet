import React from 'react';
import { styled } from '@linaria/react';

import {
  TxCanceledIcon,
  TxCanceledMPIcon,
  TxCanceledOffIcon,

  TxCompletedIcon,
  // TxCompletedMPOwnIcon,
  TxCompletedMPIcon,
  TxCompletedOffIcon,
  TxCompletedOwnIcon,

  TxPendingIcon,
  TxPendingMPIcon,
  TxPendingOffIcon,
  TxPendingOwnIcon,

  TxExpiredIcon,
} from '@app/icons';

import {
  Transaction, TxStatus, TxStatusString,
} from '@core/types';

interface StatusLabelProps {
  data: Transaction;
}

const ContainerStyled = styled.div<{ color: string }>`
  margin-top: 8px;
  font-style: italic;
  color: ${({ color }) => color};
`;

const IconStyled = styled.div<{ reverse: boolean }>`
  display: inline-block;
  vertical-align: middle;
  line-height: 0;
  margin-right: 8px;
  transform: ${({ reverse }) => (reverse ? 'rotate(180deg)' : 'none')};
`;

function getIconPos(status: TxStatus): number {
  switch (status) {
    case TxStatus.COMPLETED:
      return 1;
    case TxStatus.CANCELED:
    case TxStatus.FAILED:
      return 2;
    default:
      return 0;
  }
}

const ICONS_OFFLINE = [TxPendingOffIcon, TxCompletedOffIcon, TxCanceledOffIcon];
const ICONS_MAX_PRIVACY = [TxPendingMPIcon, TxCompletedMPIcon, TxCanceledMPIcon];
const ICONS_REGULAR = [TxPendingIcon, TxCompletedIcon, TxCanceledIcon];

function getIconComponent({ status, status_string }: Transaction): React.FC {
  const pos = getIconPos(status);
  const offline = status_string.includes('offline');
  const maxPrivacy = status_string.includes('max privacy');

  switch (true) {
    case status_string === TxStatusString.EXPIRED:
      return TxExpiredIcon;
    case status_string === TxStatusString.SELF_SENDING:
      return TxPendingOwnIcon;
    case status_string === TxStatusString.SENT_TO_OWN_ADDRESS:
      return TxCompletedOwnIcon;
    case offline:
      return ICONS_OFFLINE[pos];
    case maxPrivacy:
      return ICONS_MAX_PRIVACY[pos];
    default:
      return ICONS_REGULAR[pos];
  }
}

function getIconColor({ income, status, status_string }: Transaction): string {
  switch (true) {
    case status_string === TxStatusString.SELF_SENDING:
    case status_string === TxStatusString.SENT_TO_OWN_ADDRESS:
      return 'white';
    case status_string === TxStatusString.EXPIRED:
    case status === TxStatus.CANCELED:
      return 'var(--color-gray)';
    case status === TxStatus.FAILED:
      return 'var(--color-red)';
    default:
      return income ? 'var(--color-blue)' : 'var(--color-purple)';
  }
}

const StatusLabel: React.FC<StatusLabelProps> = ({ data }) => {
  const color = getIconColor(data);
  const IconComponent = getIconComponent(data);
  return (
    <ContainerStyled color={color}>
      <IconStyled reverse={!data.income}><IconComponent /></IconStyled>
      { data.status_string }
    </ContainerStyled>
  );
};

export default StatusLabel;
