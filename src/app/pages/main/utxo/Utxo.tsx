/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { useStore } from 'effector-react';
import { styled } from '@linaria/react';

import {
  Window,
} from '@app/uikit';

import { gotoWallet } from '@app/model';

const Utxo = () => (
  <Window title="UTXO" onBackClick={gotoWallet}>
    UTXO
  </Window>
);

export default Utxo;
