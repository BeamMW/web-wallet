import React, { useRef, useState } from 'react';
import { Loader, Window } from '@app/shared/components';
import { useSelector } from 'react-redux';
import { selectConnectedSites } from '@app/containers/Settings/store/selectors';

export const DexContainer = () => {
  const iframeRef = useRef(null);
  const [loading, setLoadingState] = useState(true);
  const sites = useSelector(selectConnectedSites());

  const handleLoad = () => {
    setLoadingState(false);
  };

  return (
    <Window title="Wallet" primary key={sites.length}>
      {loading ? <Loader /> : null}
      <iframe
        title="Dex"
        ref={iframeRef}
        src="http://dappnet-dex.beam.mw"
        width={750}
        height={800}
        onLoad={handleLoad}
        style={{
          border: 'none',
          overflow: 'scroll',
          overflowX: 'hidden',
          scrollbarWidth: 'none',
          margin: '0 -30px',
        }}
      />
    </Window>
  );
};
