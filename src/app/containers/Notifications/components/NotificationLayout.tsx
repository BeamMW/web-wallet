import React from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';

import Logo from '@app/shared/components/Logo';

interface NotificationLayoutProps {
  title: string;
  appname?: string;
  appurl?: string;
  accent?: 'green' | 'purple' | 'blue';
  children?: React.ReactNode;
  actions?: React.ReactNode;
}

const Shell = styled.div`
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 0 16px 16px;
`;

const Head = styled.header<{ accent: string }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 30px 0 20px;
  text-align: center;

  &:after {
    content: '';
    position: absolute;
    left: -16px;
    right: -16px;
    bottom: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, ${({ accent }) => `var(--color-${accent})`}, transparent);
    opacity: 0.6;
  }
`;

const logoGlow = css`
  width: 46px !important;
  height: 46px !important;
  margin: 0 !important;
  filter: drop-shadow(0 0 16px rgba(0, 246, 210, 0.5)) drop-shadow(0 0 22px rgba(218, 104, 245, 0.22));
`;

const Title = styled.h1<{ accent: string }>`
  margin: 0;
  font-family: var(--font-mono);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--cp-text);
  text-shadow: 0 0 14px ${({ accent }) => (accent === 'purple' ? 'rgba(218,104,245,0.4)' : 'rgba(0,246,210,0.35)')};
`;

const AppName = styled.div`
  font-family: var(--font-ui);
  font-size: 13px;
  color: var(--cp-muted);

  > b {
    color: var(--cp-text);
    font-weight: 700;
  }
`;

const Origin = styled.div`
  align-self: stretch;
  margin: 12px 0 0;
  padding: 9px 12px;
  clip-path: var(--cp-clip-sm);
  border: 1px solid var(--cp-line);
  background: rgba(0, 0, 0, 0.3);
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--cp-accent-3);
  word-break: break-all;
  text-align: left;

  > span {
    display: block;
    margin-bottom: 3px;
    font-size: 9px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--cp-muted);
  }
`;

const Body = styled.div`
  flex: 1;
  padding: 18px 0 8px;
`;

const Footer = styled.footer`
  position: sticky;
  bottom: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding-top: 16px;
  background: linear-gradient(180deg, rgba(5, 7, 13, 0), rgba(5, 7, 13, 0.9) 40%);

  > button {
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
  }
`;

export const NotificationLayout: React.FC<NotificationLayoutProps> = ({
  title,
  appname,
  appurl,
  accent = 'green',
  children,
  actions,
}) => (
  <Shell>
    <Head accent={accent}>
      <Logo size="icon" className={logoGlow} />
      <Title accent={accent}>{title}</Title>
      {appname && (
        <AppName>
          <b>{appname}</b>
        </AppName>
      )}
      {appurl && (
        <Origin>
          <span>Origin</span>
          {appurl}
        </Origin>
      )}
    </Head>
    <Body>{children}</Body>
    {actions && <Footer>{actions}</Footer>}
  </Shell>
);

export default NotificationLayout;
