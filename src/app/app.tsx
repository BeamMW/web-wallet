import React, { useEffect } from 'react';
import { useStore } from 'effector-react';
import { css } from '@linaria/core';

import { $view } from '@state/shared';
import { initWallet } from '@state/init';
import { getCurrentView } from '@core/router';
import { styled } from '@linaria/react';

css`
  :global() {
    :root {
      --color-background: #042548;
      --color-regular: #92abba;
      --color-active: #e4f5ff;
      --color-primary: #00f6d2;
      --color-send: #da68f5;
      --color-receive: #25c1ff;
      --color-disabled: #8da1ad;
      --color-failed: #ff746b;
      --color-ghost: rgba(255, 255, 255, 0.07);
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
      background-color: var(--color-background);
      font-size: 14px;
      color: white;
    }

    p {
      margin: 0;
      margin-bottom: 30px;
    }
  }
`;

const ContainerStyled = styled.div`
  padding-top: 50px;
`;

const App = () => {
  useEffect(() => {
    initWallet();
  }, []);

  const view = useStore($view);
  const ViewComponent = getCurrentView(view);

  return (
    <ContainerStyled>
      <ViewComponent />
    </ContainerStyled>
  );
};

export default App;
