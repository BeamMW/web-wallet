import React, { useState } from 'react';

import { setView, View } from '@state/shared';

const MENU_ITEMS = [
  {
    title: 'Wallet',
    value: View.PORTFOLIO,
  },
  {
    title: 'UTXO',
    value: View.UTXO,
  },
];

export const Menu: React.FC = ({}) => {
  const handleClick: React.MouseEventHandler<HTMLLIElement> = ({
    currentTarget,
  }) => {
    const index = parseInt(currentTarget.dataset.index);
    setView(MENU_ITEMS[index].value);
  };

  return (
    <nav>
      <ul>
        {MENU_ITEMS.map(({ title }) => (
          <li onClick={handleClick}>{title}</li>
        ))}
      </ul>
    </nav>
  );
};

export default Menu;
