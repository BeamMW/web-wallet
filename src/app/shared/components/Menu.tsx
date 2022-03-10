import React from 'react';

import { styled } from '@linaria/react';
import { css } from '@linaria/core';

import {
  CancelIcon, HelpIcon, SettingsIcon, WalletIcon,
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
    title: 'Documentation',
    value: 'https://documentation.beam.mw/',
    outside: true,
    IconComponent: HelpIcon,
  },
];

const ContainerStyled = styled.nav`
  position: fixed;
  z-index: 4;
  top: 50px;
  left: 0;
  width: 319px;
  height: 550px;
  background-image: linear-gradient(to bottom, #0a4c7e, #042548);
`;

const ListStyled = styled.ul`
  padding-top: 80px;
`;

const ListItemStyled = styled.li<{ active: boolean }>`
  height: 60px;
  line-height: 60px;
  padding-left: 30px;
  background-image: ${({ active }) => (!active ? 'none' : 'linear-gradient(to right, rgba(5, 226, 194, 0.1), rgba(5, 226, 194, 0))')};
  text-align: left;
  font-size: 16px;
  cursor: ${({ active }) => (active ? 'default' : 'pointer')};
  display: flex;
  align-items: center;
  > svg {
    margin-right: 26px;
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
}

const Menu: React.FC<MenuProps> = ({ onCancel }) => {
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
    <BackDrop onCancel={onCancel}>
      <ContainerStyled>
        <Button variant="icon" icon={CancelIcon} className={buttonStyle} onClick={onCancel} />
        <ListStyled>
          {MENU_ITEMS.map(({ title, value, IconComponent }, index) => (
            <ListItemStyled key={value} active={location.pathname === value} data-index={index} onClick={handleClick}>
              <IconComponent />
              {' '}
              {title}
            </ListItemStyled>
          ))}
        </ListStyled>
      </ContainerStyled>
    </BackDrop>
  );
};

export default Menu;
