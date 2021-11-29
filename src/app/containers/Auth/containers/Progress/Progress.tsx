import React from 'react';
import { styled } from '@linaria/react';

import { Splash } from '@app/shared/components';

import { useSelector } from 'react-redux';
import { selectWalletSyncState } from '@app/containers/Auth/store/selectors';
import { ProgressBar } from '../../../../shared/components';

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

// const wallet = WasmWallet.getInstance();

const Progress = () => {
  const syncProgress = useSelector(selectWalletSyncState());

  const syncPercent = Math.floor(100 / (syncProgress.sync_requests_total / syncProgress.sync_requests_done));

  const active = syncProgress.sync_requests_total > 0;
  const progress = `Syncing with blockchain ${syncPercent}%`;

  return (
    <Splash size="small">
      <TitleStyled>Loading</TitleStyled>
      <SubtitleStyled>{active && progress}</SubtitleStyled>
      <ProgressBar active={active} percent={syncPercent} />
      {/* <Footer>
        { loading && (
        <Button variant="ghost" icon={CancelIcon} onClick={handleCancelClick}>
          cancel
        </Button>
        ) }
      </Footer> */}
    </Splash>
  );
};

export default Progress;
