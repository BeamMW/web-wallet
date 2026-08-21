import React from 'react';
import { styled } from '@linaria/react';

export type SwapMode = 'cross-chain' | 'dex';

const TabRow = styled.div`
  display: flex;
  gap: 6px;
  padding: 0 0 14px;
  max-width: 100%;
  margin: 0 auto;
  width: 100%;

  :global(html[data-env='fullscreen']) & {
    max-width: 560px;
  }
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  height: 36px;
  clip-path: var(--cp-clip-sm);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s, box-shadow 0.15s;
  border: 1px solid ${({ active }) => (active ? 'var(--cp-line-2)' : 'var(--cp-line)')};
  background: ${({ active }) => (active ? 'rgba(218,104,245,0.12)' : 'rgba(0,0,0,0.25)')};
  color: ${({ active }) => (active ? 'var(--cp-accent-2)' : 'var(--cp-muted)')};
  box-shadow: ${({ active }) => (active ? '0 0 14px -5px rgba(218,104,245,0.6)' : 'none')};

  &:hover:not(:disabled) {
    color: var(--cp-text);
    border-color: var(--cp-line-2);
  }
`;

interface SwapModeTabsProps {
  mode: SwapMode;
  onChange: (mode: SwapMode) => void;
}

export const SwapModeTabs = ({ mode, onChange }: SwapModeTabsProps) => (
  <TabRow>
    <Tab active={mode === 'cross-chain'} type="button" onClick={() => onChange('cross-chain')}>
      Cross-chain
    </Tab>
    <Tab active={mode === 'dex'} type="button" onClick={() => onChange('dex')}>
      On-chain DEX
    </Tab>
  </TabRow>
);
