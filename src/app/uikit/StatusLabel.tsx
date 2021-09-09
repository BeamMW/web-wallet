import React from 'react';
import { styled } from '@linaria/react';

import StatusCompletedIcon from '@icons/icon-status-completed.svg';
import StatusCanceledIcon from '@icons/icon-status-canceled.svg';

import { Transaction } from '@app/core/types';

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

function getIconComponent(status: number): React.FC {
  if (status === 2) {
    return StatusCanceledIcon;
  }

  return StatusCompletedIcon;
}

function getIconColor(income: boolean, failed: boolean, status: number): string {
  if (status === 2) { // canceled
    return failed ? 'var(--color-red)' : 'var(--color-disabled)';
  }

  return income ? 'var(--color-blue)' : 'var(--color-purple)';
}

const StatusLabel: React.FC<StatusLabelProps> = ({
  data: {
    income,
    tx_type,
    status,
    status_string,
  },
}) => {
  const failed = status_string.includes('failed');

  const color = getIconColor(income, failed, status);
  const IconComponent = getIconComponent(status);

  return (
    <ContainerStyled color={color}>
      <IconStyled reverse={!income}><IconComponent /></IconStyled>
      { status_string }
    </ContainerStyled>
  );
};

export default StatusLabel;
