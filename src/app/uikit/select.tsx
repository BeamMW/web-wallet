import React, { useEffect, useRef, useState } from 'react';
import { styled } from '@linaria/react';
import { isNil } from '@core/utils';

import Angle from './Angle';

interface SelectProps {
  options: string[];
  selected: number;
  className?: string;
  onSelect: (index: number) => void;
}

const ContainerStyled = styled.div`
  display: inline-block;
  position: relative;
  margin-left: 10px;
`;

const SelectStyled = styled.ul`
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1;
  padding: 10px 0;
  border-radius: 10px;
  background-color: var(--color-select);
`;

const OptionStyled = styled.li`
  padding: 10px 20px;
  cursor: pointer;
  text-align: left;
  white-space: nowrap;

  &:hover,
  &:active {
    background-color: rgba(255, 255, 255, 0.07);
  }
`;

const OptionActiveStyled = styled(OptionStyled)`
  cursor: default;
  color: var(--color-green);

  &:hover,
  &:active {
    background-color: transparent;
  }
`;

const LinkStyled = styled.a`
  cursor: pointer;
  text-decoration: none;
  color: white;
`;

const TitleStyled = styled.span`
  padding-right: 8px;
`;

export const Select: React.FC<SelectProps> = ({
  options,
  selected,
  className,
  onSelect,
}) => {
  const [opened, setOpened] = useState(false);
  const title = options[selected];
  const selectRef = useRef<HTMLUListElement>();

  useEffect(() => {
    if (opened) {
      const { current } = selectRef;
      if (!isNil(current)) {
        current.focus();
      }
    }
  }, [opened]);

  const handleMouseDown = () => {
    setOpened(!opened);
  };

  const handleSelect: React.MouseEventHandler<HTMLElement> = ({
    currentTarget,
  }) => {
    const index = parseInt(currentTarget.dataset.index, 10);
    if (index !== selected) {
      onSelect(index);
      setOpened(false);
    }
  };

  const handleBlur = () => {
    setOpened(false);
  };

  return (
    <ContainerStyled className={className}>
      <LinkStyled href="#" onMouseDown={handleMouseDown}>
        <TitleStyled>{title}</TitleStyled>
        <Angle value={opened ? 180 : 90} margin={opened ? 3 : 1} />
      </LinkStyled>
      {opened && (
        <SelectStyled ref={selectRef} tabIndex={-1} onBlur={handleBlur}>
          {options.map((value, index) => {
            if (index === selected) {
              return (
                <OptionActiveStyled key={index}>
                  {value}
                </OptionActiveStyled>
              );
            }

            return (
              <OptionStyled
                key={index}
                data-index={index}
                onClick={handleSelect}
              >
                {value}
              </OptionStyled>
            );
          })}
        </SelectStyled>
      )}
    </ContainerStyled>
  );
};

export default Select;
