import React from 'react';
import { styled } from '@linaria/react';

import { Splash } from '@app/shared/components';

import { useSelector } from 'react-redux';
import {
  selectWalletSyncState,
  selectSyncStep,
  selectDatabaseSyncProgress,
  selectDownloadDbProgress,
} from '@app/containers/Auth/store/selectors';
import { SyncStep } from '@app/containers/Auth/interfaces';
import { ProgressBar } from '../../../../shared/components';

const TitleStyled = styled.h2`
  margin: 0;
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--cp-accent);
  text-shadow: 0 0 16px rgba(0, 246, 210, 0.4);
`;

const SubtitleStyled = styled.h3`
  min-height: 17px;
  margin: 22px 0;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--cp-muted);

  &:not(:empty):before {
    content: '> ';
    color: var(--cp-accent);
  }
`;

// const wallet = WasmWallet.getInstance();

const Progress = () => {
  const syncProgress = useSelector(selectWalletSyncState());
  const syncStep = useSelector(selectSyncStep());
  const databaseSyncProgress = useSelector(selectDatabaseSyncProgress());
  const downloadDbProgress = useSelector(selectDownloadDbProgress());

  const getSyncPercent = () => {
    switch (syncStep) {
      case SyncStep.DOWNLOAD: {
        const { done, total } = downloadDbProgress;
        return { done, total, title: 'Downloading blockchain info' };
      }
      case SyncStep.RESTORE: {
        const { done, total } = databaseSyncProgress;
        return { done, total, title: 'Unpack blockchain info' };
      }
      case SyncStep.SYNC:
      default: {
        const { sync_requests_done: done, sync_requests_total: total } = syncProgress;
        return { done, total, title: 'Syncing with blockchain' };
      }
    }
  };

  const { done, total, title } = getSyncPercent();
  // Progress can be unknown right after the popup opens — the engine has not
  // reported a step yet. Fall back to the indeterminate bar instead of "0%".
  const known = total > 0;
  const syncPercent = known ? Math.min(100, Math.max(0, Math.floor((done / total) * 100))) : 0;

  const progress = known ? `${title} ${syncPercent}%` : title;

  return (
    <Splash size="small">
      <TitleStyled>Loading</TitleStyled>
      <SubtitleStyled>{progress}</SubtitleStyled>
      <ProgressBar active={known} percent={syncPercent} />
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
