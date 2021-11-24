import React from 'react';

import {$view, setView, View} from '@app/model/view';
import {styled} from '@linaria/react';
import {css} from '@linaria/core';

import {CancelIcon} from '@app/icons';

import {useStore} from 'effector-react';
import Button from './Button';
import BackDrop from './Backdrop';
import {ROUTES} from "@app/shared/constants";
import {history} from "@app/shared/history";
import {useNavigate, useMatch} from "react-router-dom";

const MENU_ITEMS = [
    {
        title: 'Wallet',
        value: ROUTES.WALLET.BASE
    },
    // {
    //   title: 'UTXO',
    //   value: View.UTXO,
    // },
    {
        title: 'Settings',
        value: ROUTES.SETTINGS.BASE,
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
  padding-left: 70px;
  background-image: ${
          ({active}) => (
                  !active ? 'none'
                          : 'linear-gradient(to right, rgba(5, 226, 194, 0.1), rgba(5, 226, 194, 0))'
          )};
  text-align: left;
  font-size: 16px;
  cursor: ${({active}) => (active ? 'default' : 'pointer')};
`;

const buttonStyle = css`
  position: absolute;
  top: 24px;
  left: 24px;
  margin: 0;
`;

interface MenuProps {
    onCancel?: React.MouseEventHandler,
}

const Menu: React.FC<MenuProps> = ({onCancel}) => {
    const view = useStore($view);
    const navigate = useNavigate();

    const handleClick: React.MouseEventHandler<HTMLLIElement> = ({
                                                                     currentTarget,
                                                                 }) => {
        const index = parseInt(currentTarget.dataset.index, 10);
        navigate(MENU_ITEMS[index].value);
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
                    {MENU_ITEMS.map(({title, value}, index) => (
                        <ListItemStyled
                            key={value}
                            active={!!useMatch(value)}

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
