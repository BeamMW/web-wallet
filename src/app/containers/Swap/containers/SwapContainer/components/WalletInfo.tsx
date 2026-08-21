import React from 'react';
import { styled } from '@linaria/react';

const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  margin-bottom: 10px;
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid var(--cp-line);
  clip-path: var(--cp-clip-sm);
`;

const StatusDot = styled.span<{ ok: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${({ ok }) => (ok ? '#34c759' : '#ff453a')};
  box-shadow: ${({ ok }) => (ok ? '0 0 5px rgba(52,199,89,0.5)' : '0 0 5px rgba(255,69,58,0.5)')};
`;

const Address = styled.span`
  flex: 1;
  font-size: 12px;
  font-weight: 600;
  font-family: var(--font-mono);
  color: var(--cp-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
`;

const WarnBadge = styled.span`
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 10px;
  background: rgba(255, 165, 0, 0.12);
  color: #ffb340;
  flex-shrink: 0;
  white-space: nowrap;
`;

const Sep = styled.span`
  width: 1px;
  height: 12px;
  background: rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
`;

const Btn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 7px;
  border-radius: 5px;
  flex-shrink: 0;
  transition: background 0.12s, color 0.12s;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const ChangeBtn = styled(Btn)`
  color: rgba(218, 104, 245, 0.85);
  &:hover:not(:disabled) {
    background: rgba(218, 104, 245, 0.1);
    color: #da68f5;
  }
`;

const DisconnectBtn = styled(Btn)`
  color: rgba(255, 255, 255, 0.25);
  font-size: 13px;
  padding: 3px 5px;
  &:hover:not(:disabled) {
    background: rgba(255, 69, 58, 0.1);
    color: #ff453a;
  }
`;

function truncate(addr: string): string {
  return addr.length > 13 ? `${addr.slice(0, 7)}…${addr.slice(-5)}` : addr;
}

export type WalletInfoProps = {
  address: string;
  networkMismatch?: boolean;
  onChangeAccount: () => void;
  onDisconnect: () => void;
  isLoading?: boolean;
};

export const WalletInfo = ({
  address, networkMismatch, onChangeAccount, onDisconnect, isLoading,
}: WalletInfoProps) => (
  <Bar>
    <StatusDot ok={!networkMismatch} />
    <Address title={address}>{truncate(address)}</Address>
    {networkMismatch && <WarnBadge>Wrong network</WarnBadge>}
    <Sep />
    <ChangeBtn type="button" onClick={onChangeAccount} disabled={isLoading} title="Switch MetaMask account">
      Change
    </ChangeBtn>
    <DisconnectBtn type="button" onClick={onDisconnect} disabled={isLoading} title="Disconnect wallet">
      ✕
    </DisconnectBtn>
  </Bar>
);
