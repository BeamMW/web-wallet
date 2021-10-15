import { styled } from '@linaria/react';
import { css, cx } from '@linaria/core';
import React, { useEffect } from 'react';
import { isNil } from '@core/utils';
import { isAllowedSeedFx, SEED_PHRASE_COUNT } from './model';

interface SeedListProps {
  data: any[];
  errors?: boolean[];
  initial?: string;
  indexByValue?: boolean;
  onInput?: React.FormEventHandler;
}

const ListStyled = styled.ul`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
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
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    text-align: center;
    font-size: 10px;
    color: rgba(255, 255, 255, 0.2);
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
    background-color: var(--color-red);
    color: var(--color-dark-blue);
  }
`;

const validClassName = css`
  &:before {
    line-height: 20px;
    border: none;
    background-color: var(--color-green);
    color: var(--color-dark-blue);
  }
`;

const refs: HTMLInputElement[] = new Array(SEED_PHRASE_COUNT).fill(null);

const REGEXP_SEED = /(\w+;){12}/;

function fillFromSeed(seed: string, safe: boolean = false): void {
  const array = seed.split(';').slice(0, SEED_PHRASE_COUNT);

  if (!safe) {
    isAllowedSeedFx(array);
  }

  array.forEach((value, index) => {
    const target = refs[index];

    if (!isNil(target)) {
      target.value = value;
    }
  });
}

const SeedList: React.FC<SeedListProps> = ({
  data,
  errors,
  initial,
  indexByValue,
  onInput,
}) => {
  useEffect(() => {
    if (!isNil(initial)) {
      fillFromSeed(initial.replace(/\s/g, ';'), true);
    }
  }, []);

  const handleRef = (ref: HTMLInputElement) => {
    if (!isNil(ref)) {
      const { name } = ref;
      const index = parseInt(name, 10);
      refs[index] = ref;
    }
  };

  const handlePaste: React.ClipboardEventHandler = (event) => {
    if (!indexByValue) {
      const seed: string = event.clipboardData.getData('text');

      if (REGEXP_SEED.test(seed)) {
        event.preventDefault();
        fillFromSeed(seed);
      }
    }
  };

  return (
    <ListStyled onPaste={handlePaste}>
      {data.map((value, index) => {
        const idx = indexByValue ? value : index;
        const err = isNil(errors) ? value : errors[index];
        const className = cx(
          baseClassName,
          err === false && errorClassName,
          err === true && validClassName,
        );

        return (
          <li
            key={index}
            className={className}
            data-index={idx + 1}
          >
            <input
              required
              autoFocus={index === 0}
              type="text"
              name={idx}
              ref={handleRef}
              onInput={onInput}
            />
          </li>
        );
      })}
    </ListStyled>
  );
};

export default SeedList;
