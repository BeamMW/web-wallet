import React from 'react';
import { styled } from '@linaria/react';

import { Window, Button, Footer } from '@app/shared/components';

import { EyeIcon, PassIcon, CopyIcon, DoneIcon } from '@app/shared/icons';

const WarningListStyled = styled.ul`
  > li {
    position: relative;
    height: 34px;
    line-height: 34px;
    margin-bottom: 20px;
    padding-left: 60px;
    text-align: left;
  }

  svg {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
  }

  p {
    display: inline-block;
    vertical-align: middle;
    line-height: normal;
    margin: 0;
  }
`;

interface RegistrationWarningProps {
  onClick: () => void;
}

const RegistrationWarning: React.FC<RegistrationWarningProps> = ({ onClick }) => (
  <Window title="Create new wallet">
    <p>
      If you ever lose your device, you will need this phrase to recover your wallet!
      <br />
      Never type your seed phrase in keychains or password managers.
      <br />
      Never save it in your local or remote folders in any form.
    </p>
    <WarningListStyled>
      <li>
        <EyeIcon width={48} height={34} />
        <p>Do not let anyone see your seed phrase</p>
      </li>
      <li>
        <PassIcon width={48} height={34} />
        <p>Never type your seed phrase into password managers or elsewhere</p>
      </li>
      <li>
        <CopyIcon width={48} height={34} />
        <p>Make at least 2 copies of the phrase in case of emergency</p>
      </li>
    </WarningListStyled>
    <Footer>
      <Button icon={DoneIcon} type="button" onClick={() => onClick()}>
        I understand
      </Button>
    </Footer>
  </Window>
);

export default RegistrationWarning;
