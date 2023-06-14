import React, { useRef, useState } from 'react';
import { Loader, Window } from '@app/shared/components';
import { useSelector } from 'react-redux';
import { selectConnectedSites } from '@app/containers/Settings/store/selectors';
import config from '@app/config';

export const DexContainer = () => {
  const iframeRef = useRef(null);
  const [loading, setLoadingState] = useState(true);
  const sites = useSelector(selectConnectedSites());

  const handleLoad = () => {
    setTimeout(() => {
      setLoadingState(false);
    }, 3000);
  };

  return (
    <Window title="Wallet" primary key={sites.length}>
      {loading ? <Loader /> : null}
      <iframe
        title="Dex"
        ref={iframeRef}
        src={config.dex_url}
        width={750}
        height={800}
        onLoad={handleLoad}
        style={{
          border: 'none',
          overflow: 'scroll',
          overflowX: 'hidden',
          scrollbarWidth: 'none',
          margin: '0 -30px',
          opacity: loading ? 0 : 1,
        }}
      />
    </Window>
  );
};
