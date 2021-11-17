import React from 'react';
import { useStore } from 'effector-react';
import { styled } from '@linaria/react';

import { Splash } from 'app/shared/components';
// import WasmWallet from "@core/WasmWallet";
//
// import { useNavigate } from "react-router-dom";
import ProgressBar from './ProgressBar';
// $loading, setLoading
import { $syncPercent, $syncProgress } from './model';

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
  const [total] = useStore($syncProgress);
  const syncPercent = useStore($syncPercent);

  // const navigate = useNavigate();

  // const handleCancelClick = () => {
  //   wallet.stop();
  //   setLoading(false);
  //   navigate(ROUTES.AUTH.LOGIN);
  // };

  const active = total > 0;
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
