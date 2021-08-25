import React, { useState } from 'react';
import { styled } from '@linaria/react';

interface SelectProps {
  options: string[];
  selected: number;
}

const ContainerStyled = styled.div`
  display: inline-block;
  position: relative;
`;

const SelectStyled = styled.ul`
  list-style: none;
  position: absolute;
  top: 0;
  left: 0;
  background-color: var(--color-select);
`;

const OptionStyled = styled.li`
  padding: 10px 0;

  &:hover,
  &:active {
    background-color: rgba(255, 255, 255, 0.07);
  }
`;

const LinkStyled = styled.a`
  cursor: pointer;
  text-decoration: none;
`;

export const Select: React.FC<SelectProps> = ({ options, selected }) => {
  const [opened, setOpened] = useState(false);
  const title = options[selected];

  const handleClick = () => {
    setOpened(!opened);
  };

  return (
    <ContainerStyled>
      <LinkStyled href="#" onClick={handleClick}>
        {title}
      </LinkStyled>
      {opened && (
        <SelectStyled>
          {options.map(value => (
            <OptionStyled>{value}</OptionStyled>
          ))}
        </SelectStyled>
      )}
    </ContainerStyled>
  );
};

export default Select;
