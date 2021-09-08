import React from 'react';

import { $view, setView, View } from '@app/model';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';

import CancelIcon from '@icons/icon-cancel.svg';

import { useStore } from 'effector-react';
import Button from './Button';
import BackDrop from './Backdrop';

const MENU_ITEMS = [
  {
    title: 'Wallet',
    value: View.WALLET,
  },
  {
    title: 'UTXO',
    value: View.UTXO,
  },
];

const ContainerStyled = styled.nav`
  position: absolute;
  top: 0;
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
  padding-left: 70px;
  background-image: ${
  ({ active }) => (
    active ? 'linear-gradient(to right, rgba(5, 226, 194, 0.1), rgba(5, 226, 194, 0))' : 'none'
  )};
  text-align: left;
  font-size: 16px;
`;

const buttonStyle = css`
  position: absolute;
  top: 24px;
  left: 24px;
`;

interface MenuProps {
  onCancel?: React.MouseEventHandler,
}

const Menu: React.FC<MenuProps> = ({ onCancel }) => {
  const view = useStore($view);

  const handleClick: React.MouseEventHandler<HTMLLIElement> = ({
    currentTarget,
  }) => {
    const index = parseInt(currentTarget.dataset.index, 10);
    setView(MENU_ITEMS[index].value);
  };

  return (
    <BackDrop onCancel={onCancel}>
      <ContainerStyled>
        <Button
          variant="icon"
          icon={CancelIcon}
          className={buttonStyle}
          onClick={onCancel}
        />
        <ListStyled>
          {MENU_ITEMS.map(({ title, value }, index) => (
            <ListItemStyled
              key={value}
              active={value === view}
              data-index={index}
              onClick={handleClick}
            >
              {title}
            </ListItemStyled>
          ))}
        </ListStyled>
      </ContainerStyled>
    </BackDrop>
  );
};

export default Menu;
