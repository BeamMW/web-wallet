import { styled } from '@linaria/react';
import { css, cx } from '@linaria/core';
import React, { useState, useRef, useEffect } from 'react';
import { unlinkSync } from 'node:fs';
import { isNil } from '@core/utils';

interface callbackFn {
  (value: any, index: number): string;
}

interface SeedListProps {
  data: any[];
  errors?: boolean[];
  indexByValue?: boolean;
  onInput?: React.FormEventHandler;
}

const ListStyled = styled.ul`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 0 10px;
`;

const baseClassName = css`
  position: relative;
  display: inline-block;
  width: 140px;
  height: 32px;
  margin-bottom: 10px;
  padding-left: 30px;

  &:before {
    position: absolute;
    top: 12px;
    left: 0;
    content: attr(data-index);
    width: 20px;
    height: 20px;
    line-height: 18px;
    border: 1px solid var(--color-ghost-medium);
    border-radius: 50%;
    text-align: center;
    font-size: 10px;
    color: var(--color-ghost-medium);
    box-sizing: border-box;
  }

  > input {
    width: 110px;
    height: 32px;
    line-height: 16px;
    padding-top: 16px;
    background-color: transparent;
    border: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
  }
`;

const errorClassName = css`
  &:before {
    line-height: 20px;
    border: none;
    background-color: var(--color-invalid);
    color: var(--color-background);
  }
`;

const validClassName = css`
  &:before {
    line-height: 20px;
    border: none;
    background-color: var(--color-primary);
    color: var(--color-background);
  }
`;

const SeedList: React.FC<SeedListProps> = ({
  data,
  errors,
  indexByValue,
  onInput,
}) => (
  <ListStyled>
    {data.map((value, index) => {
      const idx = indexByValue ? value : index;
      const err = isNil(errors) ? value : errors[index];
      const className = cx(
        baseClassName,
        err === true && errorClassName,
        err === false && validClassName,
      );

      return (
        <li key={index} className={className} data-index={idx + 1}>
          <input required type="text" name={idx} onInput={onInput} />
        </li>
      );
    })}
  </ListStyled>
);

export default SeedList;
