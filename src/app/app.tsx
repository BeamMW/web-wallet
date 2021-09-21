import React, { useEffect } from 'react';
import { useStore } from 'effector-react';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';

import { $view, setView, View } from '@app/model/view';
import { setOnboarding } from '@app/model/base';

import { setName } from '@pages/notifications/connect/model';
import { setParams } from "@pages/notifications/approveinvoke/model";

import { sendWalletEvent } from '@app/core/api';
import WalletController from '@app/core/WalletController';
import { EnvironmentType, Notification, NotificationType } from '@core/types';

import ROUTES from './core/routes';

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
css`
  :global() {
    :root {
      --color-popup: #003f6f;

      --color-purple: #da68f5;
      --color-red: #ff5354;
      --color-yellow: #f4ce4a;
      --color-green: #00f6d2;
      --color-blue: #0bccf7;
      --color-dark-blue: #042548;
      --color-white: #ffffff;
      --color-gray: #8196a4;

      --color-select: #184469;

      --color-ghost: rgba(255, 255, 255, 0.1);
      --color-ghost-medium: rgba(255, 255, 255, 0.2);
      --color-ghost-active: rgba(255, 255, 255, 0.3);

      --color-disabled: #8da1ad;
    }

    @font-face {
      font-family: 'ProximaNova';
      src: url('/assets/fonts/ProximaNova-Regular.ttf');
      font-weight: 400;
      font-style: normal;
    }

    @font-face {
      font-family: 'ProximaNova';
      src: url('/assets/fonts/ProximaNova-RegularIt.ttf');
      font-weight: 400;
      font-style: italic;
    }

    @font-face {
      font-family: 'ProximaNova';
      src: url('/assets/fonts/ProximaNova-Semibold.ttf');
      font-weight: 600;
      font-style: normal;
    }

    @font-face {
      font-family: 'ProximaNova';
      src: url('/assets/fonts/ProximaNova-Bold.ttf');
      font-weight: 700;
      font-style: normal;
    }

    @font-face {
      font-family: 'SFProDisplay';
      src: url('/assets/fonts/SFProDisplay-Regular.ttf');
      font-weight: 400;
      font-style: normal;
    }

    @font-face {
      font-family: 'SFProDisplay';
      src: url('/assets/fonts/SFProDisplay-RegularItalic.ttf');
      font-weight: 400;
      font-style: italic;
    }

    @font-face {
      font-family: 'SFProDisplay';
      src: url('/assets/fonts/SFUIDisplay-Medium.otf');
      font-weight: 600;
      font-style: normal;
    }

    @font-face {
      font-family: 'SFProDisplay';
      src: url('/assets/fonts/SFProDisplay-Bold.ttf');
      font-weight: 700;
      font-style: normal;
    }

    * {
      box-sizing: border-box;
      outline: none;
    }

    html,
    body {
      margin: 0;
      padding: 0;
    }

    html {
      width: 375px;
      height: 600px;
    }

    html * {
      font-family: 'ProximaNova', sans-serif;
    }

    body {
      background-color: var(--color-dark-blue);
      font-size: 14px;
      color: white;
    }

    p {
      margin: 0;
      margin-bottom: 30px;
    }

    ul,
    ol {
      list-style: none;
      margin: 0;
      padding: 0;
    }
  }
`;

const walletController = WalletController.getInstance();

async function initWallet(bg) {
  walletController.init(bg);
  bg.init((state) => {
    const {onboarding, isrunning} = state;
    if (isrunning) {
      setView(View.PROGRESS);
    } else {
      setOnboarding(onboarding);
    }
  }, sendWalletEvent);
}

async function initNotification(bg) {
  walletController.init(bg);
  const data: Notification  = await bg.loadNotificationInfo();
  if (data.type === NotificationType.CONNECT) {
    setView(View.CONNECT);
    setName(data.name);
  } else if (data.type === NotificationType.APPROVE_INVOKE) {
    setView(View.APPROVEINVOKE);
    setParams(data.params);
  }
}

const App = (bg) => {
  useEffect(() => {
    if (bg.windowType === EnvironmentType.FULLSCREEN || bg.windowType === EnvironmentType.POPUP) {
      initWallet(bg.background);
    } else if (bg.windowType === EnvironmentType.NOTIFICATION) {
      initNotification(bg.background);
    }
  }, []);

  const view = useStore($view);
  const ViewComponent = ROUTES[view];

  return (
    <ViewComponent />
  );
};

export default App;
