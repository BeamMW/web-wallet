import React from 'react';

import { setView, View } from '@app/model';

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

const Menu: React.FC = () => {
  const handleClick: React.MouseEventHandler<HTMLLIElement> = ({
    currentTarget,
  }) => {
    const index = parseInt(currentTarget.dataset.index, 10);
    setView(MENU_ITEMS[index].value);
  };

  return (
    <nav>
      <ul>
        {MENU_ITEMS.map(({ title }) => (
          // eslint-disable-next-line
          <li onClick={handleClick}>{title}</li>
        ))}
      </ul>
    </nav>
  );
};

export default Menu;
