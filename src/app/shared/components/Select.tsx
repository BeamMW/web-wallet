import React, { useEffect, useRef, useState } from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';
import Angle from './Angle';

const ContainerStyled = styled.div`
  display: inline-block;
  position: relative;
  margin-left: 10px;
`;

const SelectStyled = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1000;
  margin-top: 8px;
  padding: 6px;
  clip-path: var(--cp-clip);
  border: 1px solid var(--cp-line-2);
  background-color: var(--cp-panel);
  max-height: 200px;
  overflow-y: auto;
  overflow-x: hidden;
  box-shadow: 0 18px 40px -14px rgba(0, 0, 0, 0.8);
  min-width: 130px;
`;

const OptionStyled = styled.div`
  padding: 9px 12px;
  cursor: pointer;
  text-align: left;
  white-space: nowrap;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--cp-text);
  clip-path: var(--cp-clip-sm);

  &:hover,
  &:active {
    background-color: rgba(0, 246, 210, 0.08);
  }
`;

const OptionActiveStyled = styled(OptionStyled)`
  cursor: default;
  color: var(--cp-accent);

  &:hover,
  &:active {
    background-color: transparent;
  }
`;

const ButtonStyled = styled.button`
  line-height: 26px;
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  padding: 0;
  border: none;
  background-color: transparent;
  text-decoration: none;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--cp-text);
  white-space: nowrap;

  &:hover,
  &:active {
    background-color: transparent;
    color: var(--cp-accent);
  }
`;

const angleStyle = css`
  display: inline-block;
  vertical-align: text-top;
  margin-left: 8px;
`;

interface OptionProps {
  // eslint-disable-next-line
  value: any;
  active?: boolean;
  onClick?: React.MouseEventHandler;
  children?: React.ReactNode;
}

export const Option: React.FC<OptionProps> = ({ active, children, onClick }) => {
  if (active) {
    return <OptionActiveStyled>{children}</OptionActiveStyled>;
  }

  return <OptionStyled onClick={onClick}>{children}</OptionStyled>;
};

interface SelectProps<T = any> {
  value: T;
  className?: string;
  onSelect: (value: T) => void;
  children?: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  value, className, children, onSelect,
}) => {
  const [opened, setOpened] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!opened) return undefined;
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpened(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [opened]);

  const array = React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement<OptionProps>[];

  const disabled = array.length === 1;

  const options = array.map((child) => {
    const { value: next } = child.props;
    const active = value === next;

    const handleClick: React.MouseEventHandler<HTMLElement> = (event) => {
      if (active) {
        event.preventDefault();
        return;
      }
      onSelect(next);
      setOpened(false);
    };

    return React.cloneElement(child, {
      active,
      onClick: handleClick,
    } as Partial<OptionProps>);
  });

  const selected = array.find((child) => value === child.props.value) ?? array[0];

  const handleToggle = () => {
    setOpened((v) => !v);
  };

  return (
    <ContainerStyled ref={containerRef} className={className}>
      <ButtonStyled type="button" onClick={handleToggle} disabled={disabled}>
        {selected?.props.children}
        {options.length > 1 && <Angle className={angleStyle} value={opened ? 0 : 180} margin={opened ? 3 : 1} />}
      </ButtonStyled>

      {opened && <SelectStyled>{options}</SelectStyled>}
    </ContainerStyled>
  );
};

export default Select;
