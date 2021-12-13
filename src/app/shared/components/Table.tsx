import React, { useState } from 'react';
import { styled } from '@linaria/react';

interface CellConfig {
  name: string;
  title: string;
  fn?: (value: any, source: any) => string;
}

interface TableProps {
  keyBy: string;
  data: any[];
  config: CellConfig[];
}

const isPositive = (value: number) => 1 / value > 0;

const Header = styled.th<{ active: boolean }>`
  text-align: left;
  color: ${({ active }) => {
    if (active === null) {
      return 'black';
    }
    return active ? 'red' : 'blue';
  }};
`;

export const Table: React.FC<TableProps> = ({ keyBy, data, config }) => {
  const [filterBy, setFilterBy] = useState(0);

  const sortFn = (objectA, objectB) => {
    const { name } = config[Math.abs(filterBy)];
    const a = objectA[name];
    const b = objectB[name];

    if (a === b) {
      return 0;
    }

    const sign = isPositive(filterBy) ? 1 : -1;
    return a > b ? sign : -sign;
  };

  const handleSortClick: React.MouseEventHandler<HTMLElement> = (event) => {
    const index = parseInt(event.currentTarget.dataset.index, 10);
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
              active={index !== Math.abs(filterBy) ? null : isPositive(filterBy)}
              onClick={handleSortClick}
            >
              {title}
            </Header>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.sort(sortFn).map((item) => (
          <tr key={item[keyBy]}>
            {config.map(({ name, fn }, index) => {
              const value = item[name];
              return <td key={index}>{!fn ? value : fn(value, item)}</td>;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
