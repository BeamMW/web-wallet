import { styled } from '@linaria/react';
import { css, cx } from '@linaria/core';
import React, { useEffect } from 'react';

import { checkIsAllowedSeed } from '@app/containers/Auth/store/actions';
import { SEED_PHRASE_COUNT } from '@app/containers/Auth/store/reducer';
import store from '@app/store/rootStore';

interface SeedListProps {
  data: any[];
  errors?: boolean[];
  initial?: string;
  indexByValue?: boolean;
  onInput?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ListStyled = styled.ul`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 6px 8px;
  padding: 0;
`;

const baseClassName = css`
  position: relative;
  display: inline-block;
  width: calc(50% - 4px);
  height: 34px;
  margin-bottom: 6px;
  padding-left: 28px;

  &:before {
    position: absolute;
    top: 8px;
    left: 0;
    content: attr(data-index);
    width: 20px;
    height: 20px;
    line-height: 18px;
    border: 1px solid var(--cp-line);
    border-radius: 50%;
    text-align: center;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--cp-muted);
    box-sizing: border-box;
  }

  > input {
    width: 100%;
    height: 34px;
    line-height: 16px;
    padding: 14px 4px 4px;
    background-color: transparent;
    border: none;
    border-bottom: 1px solid var(--cp-line);
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--cp-text);

    &:focus {
      border-bottom-color: var(--cp-accent);
    }
  }
`;

const errorClassName = css`
  &:before {
    line-height: 20px;
    border: none;
    background-color: var(--cp-danger);
    color: #04121a;
  }
`;

const validClassName = css`
  &:before {
    line-height: 20px;
    border: none;
    background-color: var(--cp-accent);
    color: #04121a;
    box-shadow: 0 0 10px -2px rgba(0, 246, 210, 0.6);
  }
`;

const refs: HTMLInputElement[] = new Array(SEED_PHRASE_COUNT).fill(null);

const REGEXP_SEED = /(\w+;){12}/;

function fillFromSeed(seed: string, safe: boolean = false): void {
  const array = seed.split(';').slice(0, SEED_PHRASE_COUNT);

  if (!safe) {
    store.dispatch(checkIsAllowedSeed.request(array));
  }

  array.forEach((value, index) => {
    const target = refs[index];

    if (target) {
      target.value = value;
    }
  });
}

const SeedList: React.FC<SeedListProps> = ({
  data, errors, initial, indexByValue, onInput,
}) => {
  useEffect(() => {
    if (initial) {
      fillFromSeed(initial.replace(/\s/g, ';'), true);
    }
  }, [initial]);

  const handleRef = (ref: HTMLInputElement) => {
    if (ref) {
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
        const err = !errors ? value : errors[index];
        const className = cx(baseClassName, err === false && errorClassName, err === true && validClassName);

        return (
          <li key={index} className={className} data-index={idx + 1}>
            <input required autoFocus={index === 0} type="text" name={idx} ref={handleRef} onInput={onInput} />
          </li>
        );
      })}
    </ListStyled>
  );
};

export default SeedList;
