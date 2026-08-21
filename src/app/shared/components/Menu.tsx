import React from 'react';

import { styled } from '@linaria/react';
import { css } from '@linaria/core';

import {
  CancelIcon, DexIcon, HelpIcon, SettingsIcon, WalletIcon,
} from '@app/shared/icons';

import { ROUTES } from '@app/shared/constants';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from './Button';
import BackDrop from './Backdrop';

const MENU_ITEMS = [
  {
    title: 'Wallet',
    value: ROUTES.WALLET.BASE,
    IconComponent: WalletIcon,
  },
  {
    title: 'Settings',
    value: ROUTES.SETTINGS.BASE,
    IconComponent: SettingsIcon,
  },
  {
    title: 'DEX',
    value: ROUTES.DEX.BASE,
    IconComponent: DexIcon,
    className: 'dex',
  },
  {
    title: 'Documentation',
    value: 'https://beam.mw/docs',
    outside: true,
    IconComponent: HelpIcon,
  },
];

const ContainerStyled = styled.nav<{ closing: boolean }>`
  position: fixed;
  z-index: 101;
  top: 0;
  left: 0;
  width: 300px;
  max-width: 82%;
  height: 100vh;
  background: var(--cp-panel);
  border-right: 1px solid var(--cp-line);
  box-shadow: 1px 0 0 rgba(0, 246, 210, 0.35), 0 0 40px -10px rgba(0, 246, 210, 0.4);
  animation: ${({ closing }) => (closing ? 'menuSlideOut' : 'menuSlideIn')} 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  will-change: transform;
  overflow: hidden;

  @keyframes menuSlideIn {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }

  @keyframes menuSlideOut {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-100%);
    }
  }
`;

const ListStyled = styled.ul`
  padding-top: 80px;
`;

const ListItemStyled = styled.li<{ active: boolean }>`
  position: relative;
  height: 56px;
  padding-left: 30px;
  background-image: ${({ active }) => (!active ? 'none' : 'linear-gradient(to right, rgba(0, 246, 210, 0.1), rgba(0, 246, 210, 0))')};
  text-align: left;
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${({ active }) => (active ? 'var(--cp-accent)' : 'var(--cp-muted)')};
  cursor: ${({ active }) => (active ? 'default' : 'pointer')};
  display: flex;
  align-items: center;
  transition: color 0.15s, background 0.15s;

  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--cp-accent);
    box-shadow: 0 0 10px var(--cp-accent);
    opacity: ${({ active }) => (active ? 1 : 0)};
  }

  &:hover {
    color: ${({ active }) => (active ? 'var(--cp-accent)' : 'var(--cp-text)')};
  }

  > svg {
    width: 22px;
    height: 22px;
    margin-right: 22px;
    flex-shrink: 0;
  }
`;

const buttonStyle = css`
  position: absolute;
  top: 24px;
  left: 24px;
  margin: 0;
`;

interface MenuProps {
  onCancel?: React.MouseEventHandler;
  closing?: boolean;
}

const Menu: React.FC<MenuProps> = ({ onCancel, closing = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick: React.MouseEventHandler<HTMLLIElement> = ({ currentTarget }) => {
    const index = parseInt(currentTarget.dataset.index, 10);
    const item = MENU_ITEMS[index];
    if (!item.outside) {
      navigate(item.value);
    } else {
      window.open(item.value);
    }
  };

  return (
    <BackDrop onCancel={onCancel} closing={closing}>
      <ContainerStyled closing={closing}>
        <Button variant="icon" icon={CancelIcon} className={buttonStyle} onClick={onCancel} />
        <ListStyled>
          {MENU_ITEMS.map(({
            title, value, className, IconComponent,
          }, index) => (
            <ListItemStyled
              key={value}
              active={location.pathname === value}
              data-index={index}
              onClick={handleClick}
              className={className}
            >
              <IconComponent />
              {title}
            </ListItemStyled>
          ))}
        </ListStyled>
      </ContainerStyled>
    </BackDrop>
  );
};

export default Menu;
