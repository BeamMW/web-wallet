import { css } from '@linaria/core';

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
css`
  :global() {
    :root {
      --color-purple: #da68f5;
      --color-red: #f25f5b;
      --color-yellow: #f4ce4a;
      --color-green: #00f6d2;
      --color-blue: #0bccf7;
      --color-dark-blue: #042548;
      --color-white: #ffffff;
      --color-gray: #8196a4;
      --color-white: white;
      --color-violet: #c061e0;

      --color-popup-mainnet: #003f6f;
      --color-popup-testnet: #342e41;
      --color-popup-masternet: #323232;
      --color-popup-dappnet: #323232;
      --color-hover-mainnet: #114b77;
      --color-hover-testnet: #711a75;
      --color-hover-masternet: rgba(255, 255, 255, 0.05);
      --color-hover-dappnet: rgba(255, 255, 255, 0.05);
      --color-select: #184469;

      --color-disabled: #8da1ad;

      --color-bg-mainnet: var(--color-dark-blue);
      --color-bg-testnet: #1e172c;
      --color-bg-masternet: #171717;
      --color-bg-dappnet: #000a16;
      --color-gradient-start-mainnet: rgba(3, 91, 143, 0);
      --color-gradient-start-testnet: #1a132d;
      --color-gradient-start-masternet: #171717;
      --color-gradient-start-dappnet: #000a16;
      --color-gradient-finish-mainnet: #035b8f;
      --color-gradient-finish-testnet: #4c3677;
      --color-gradient-finish-masternet: #393939;
      --color-gradient-finish-dappnet: #001f45;

      /* ── cyberpunk redesign tokens ─────────────────────────── */
      --cp-ground: #05070d;
      --cp-panel: #0b1018;
      --cp-panel-2: #0e1622;
      --cp-text: #dbeee9;
      --cp-muted: #6f8a93;
      --cp-accent: #00f6d2;
      --cp-accent-2: #da68f5;
      --cp-accent-3: #0bccf7;
      --cp-danger: #f25f5b;
      --cp-line: rgba(0, 246, 210, 0.14);
      --cp-line-2: rgba(218, 104, 245, 0.16);
      --cp-hair: rgba(255, 255, 255, 0.06);
      --cp-notch: 10px;
      --cp-clip: polygon(
        var(--cp-notch) 0,
        100% 0,
        100% calc(100% - var(--cp-notch)),
        calc(100% - var(--cp-notch)) 100%,
        0 100%,
        0 var(--cp-notch)
      );
      --cp-clip-sm: polygon(7px 0, 100% 0, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0 100%, 0 7px);
      --font-mono: ui-monospace, 'SF Mono', 'JetBrains Mono', 'Cascadia Code', Menlo, Consolas, monospace;
      --font-ui: 'ProximaNova', system-ui, -apple-system, 'Segoe UI', sans-serif;
    }

    @keyframes cp-pulse {
      0%,
      100% {
        opacity: 1;
      }
      50% {
        opacity: 0.35;
      }
    }

    /* Static scanline texture overlay (no animation). */
    body::after {
      content: '';
      position: fixed;
      inset: 0;
      z-index: 9997;
      pointer-events: none;
      background: repeating-linear-gradient(180deg, rgba(0, 0, 0, 0) 0 2px, rgba(0, 0, 0, 0.09) 2px 3px);
      opacity: 0.5;
      mix-blend-mode: multiply;
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

    /* Icons ship with wildly varying intrinsic sizes (16–48px). Cap any icon
       rendered directly inside a control so a missed explicit size can't blow
       up the layout; components that set an explicit size still win. */
    button > svg,
    a > svg {
      max-width: 24px;
      max-height: 24px;
    }

    html,
    body {
      margin: 0;
      padding: 0;
    }

    html {
      width: 100%;
      height: 100%;
    }

    html[data-env='popup'] {
      width: 400px;
      height: 600px;
      overflow: hidden;
    }

    html * {
      font-family: 'ProximaNova', sans-serif;
    }

    body {
      background-color: var(--cp-ground);
      background-image: radial-gradient(900px 500px at 12% -12%, rgba(0, 246, 210, 0.06), transparent 60%),
        radial-gradient(700px 420px at 100% 0%, rgba(218, 104, 245, 0.06), transparent 55%),
        linear-gradient(rgba(0, 246, 210, 0.028) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 246, 210, 0.028) 1px, transparent 1px);
      background-size: 100% 100%, 100% 100%, 28px 28px, 28px 28px;
      background-attachment: fixed;
      font-size: 14px;
      color: var(--cp-text);
      width: 100%;
      height: 100%;
    }

    #root {
      width: 100%;
      height: 100%;
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
