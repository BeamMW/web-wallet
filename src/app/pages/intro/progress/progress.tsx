import React from 'react';
import { useStore } from 'effector-react';
import { styled } from '@linaria/react';

import { Button, Splash, Footer } from 'app/uikit';
import { setView, View } from '@state/shared';
import { $syncProgress, $syncPercent } from '@state/intro';

import CancelIcon from '@icons/icon-cancel.svg';
import WasmWallet from '@core/WasmWallet';

import ProgressBar from './ProgressBar';

const TitleStyled = styled.h2`
  margin: 0;
  font-size: 16px;
`;

const SubtitleStyled = styled.h3`
  opacity: 0.5;
  height: 17px;
  margin: 30px 0;
  color: white;
  font-size: 14px;
  font-weight: 400;
  font-style: italic;
`;

const wallet = WasmWallet.getInstance();

const Progress = () => {
  const [done, total] = useStore($syncProgress);
  const syncPercent = useStore($syncPercent);

  const handleCancelClick = () => {
    wallet.stop();
    setView(View.LOGIN);
  };

  const active = total > 0;
  const progress = `Syncing with blockchain ${syncPercent}% (${done}/${total})`;

  return (
    <Splash size="small">
      <TitleStyled>Loading</TitleStyled>
      <SubtitleStyled>{active && progress}</SubtitleStyled>
      <ProgressBar active={active} percent={syncPercent} />
      <Footer>
        <Button variant="ghost" icon={CancelIcon} onClick={handleCancelClick}>
          cancel
        </Button>
      </Footer>
    </Splash>
  );
};

export default Progress;
