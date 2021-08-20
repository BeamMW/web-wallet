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
      --color-popup: #003f6f;

      --color-purple: #da68f5;
      --color-red: #ff5354;
      --color-yellow: #f4ce4a;
      --color-green: #00f6d2;
      --color-blue: #0bccf7;
      --color-dark-blue: #042548;
      --color-white: #ffffff;

      --color-ghost: rgba(255, 255, 255, 0.1);
      --color-ghost-medium: rgba(255, 255, 255, 0.2);
      --color-ghost-active: rgba(255, 255, 255, 0.3);

      --color-disabled: #8da1ad;
      --color-failed: #ff746b;
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
      margin: 0;
      padding: 0;
    }
  }
`;

const ContainerStyled = styled.div`
  position: relative;
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
