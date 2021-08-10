import { isNil } from '@app/utils';
import React, { useState } from 'react';

import { styled } from '@linaria/react';

interface CellConfig {
  name: string;
  title: string;
  fn?: (value: any, source: any) => string;
}

interface TableProps {
  key: string;
  data: any[];
  config: CellConfig[];
}

const isPositive = (value: number) => 1 / value > 0;

const Header = styled.th<{ active: boolean }>`
  text-align: left;
  color: ${({ active }) => {
    if (isNil(active)) {
      return 'black';
    }
    return active ? 'red' : 'blue';
  }};
`;

const Table: React.FC<TableProps> = ({ key, data, config }) => {
  const [filterBy, setFilterBy] = useState(0);

  const sortFn = (objectA, objectB) => {
    const name = config[Math.abs(filterBy)].name;
    const a = objectA[name];
    const b = objectB[name];

    if (a === b) {
      return 0;
    }

    const sign = isPositive(filterBy) ? 1 : -1;
    return a > b ? sign : -sign;
  };

  const handleSortClick: React.MouseEventHandler<HTMLElement> = event => {
    const index = parseInt(event.currentTarget.dataset.index);
    setFilterBy(index === filterBy ? -filterBy : index);
  };

  return (
    <table>
      <thead>
        <tr>
          {config.map(({ title }, index) => (
            <Header
              key={index}
              data-index={index}
              active={
                index !== Math.abs(filterBy) ? null : isPositive(filterBy)
              }
              onClick={handleSortClick}
            >
              {title}
            </Header>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.sort(sortFn).map(item => (
          <tr key={item[key]}>
            {config.map(({ name, fn }, index) => {
              const value = item[name];
              return <td key={index}>{isNil(fn) ? value : fn(value, item)}</td>;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
