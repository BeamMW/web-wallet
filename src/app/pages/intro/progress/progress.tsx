import React from 'react';
import { useStore } from 'effector-react';
import { Button, Splash } from '@pages/shared';
import { styled } from '@linaria/react';

import { $syncProgress, $syncPercent } from '@state/intro';

import CancelIcon from '@icons/icon-cancel.svg';
import WasmWallet from '@core/WasmWallet';

const TitleStyled = styled.h2`
  font-size: 16px;
`;

const SubtitleStyled = styled.h3`
  opacity: 0.5;
  color: white;
  font-style: italic;
`;

const ProgressBarStyled = styled.div<{ percent: number }>`
  position: relative;
  width: 256px;
  height: 4px;
  margin: 0 auto;
  border: 1px solid var(--color-ghost);
  border-raddius: 2px;

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: ${({ percent }) => percent}%;
    height: 4px;
    border-raddius: 2px;
    background-color: var(--color-green);
  }
`;

const wallet = WasmWallet.getInstance();

const Progress = () => {
  const [done, total] = useStore($syncProgress);
  const syncPercent = useStore($syncPercent);

  const handleCancelClick = () => {
    wallet.stop();
  };

  return (
    <Splash size="small">
      <TitleStyled>Loading</TitleStyled>
      {total > 0 && (
        <SubtitleStyled>
          {syncPercent}% ({done}/{total})
        </SubtitleStyled>
      )}
      <ProgressBarStyled percent={syncPercent} />
      <Button color="ghost" icon={CancelIcon} onClick={handleCancelClick}>
        cancel
      </Button>
    </Splash>
  );
};

export default Progress;
