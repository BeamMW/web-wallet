import { GROTHS_IN_BEAM } from '@app/model/rates';
import { createEvent, Event } from 'effector';
import React from 'react';

export const isNil = (value: any) => value == null;

export function getInputValue({ target }: React.ChangeEvent<HTMLInputElement>): string {
  return target.value;
}

export function fromCheckbox({ target }: React.ChangeEvent<HTMLInputElement>): boolean {
  return target.checked;
}

export const curry = <T>(event: Event<T>, payload: T) => event.prepend(() => payload);

type ReactChangeEvent = React.ChangeEvent<HTMLInputElement>;

type Callback<T = unknown> = (value: T) => void;

export function makeOnChange(event: Event<string> | Callback<string>) {
  const onChange = createEvent<ReactChangeEvent>();
  onChange.map<string>(getInputValue).watch(event);
  return onChange;
}

export function preventEvent(event: React.SyntheticEvent) {
  event.preventDefault();
  event.stopPropagation();
  return event;
}

export function makePrevented(
  callback: Event<void> | Callback<void>,
) {
  const clock = createEvent<React.SyntheticEvent>().map(preventEvent);
  clock.watch(() => callback());
  return clock;
}

export function compact(value: string): string {
  if (value.length <= 11) {
    return value;
  }
  return `${value.substr(0, 5)}…${value.substr(-5, 5)}`;
}

const LENGTH_MAX = 8;

export function truncate(value: string): string {
  if (value === '' || isNil(value)) {
    console.warn('utils: truncate failed', value);
    return '';
  }

  if (value.length <= LENGTH_MAX) {
    return value;
  }

  return `${value.slice(0, LENGTH_MAX)}…`;
}

export function toUSD(amount: number, rate: number): string {
  switch (true) {
    case amount === 0 || Number.isNaN(amount):
      return '0 USD';
    case amount > 0.01: {
      const value = amount * rate;
      return `${value.toFixed(2)} USD`;
    }
    default:
      return '< 1 cent';
  }
}

export function fromGroths(value: number): number {
  return value > 0 ? value / GROTHS_IN_BEAM : 0;
}

export function toGroths(value: number): number {
  return value > 0 ? Math.floor(value * GROTHS_IN_BEAM) : 0;
}

export function getSign(positive: boolean): string {
  return positive ? '+ ' : '- ';
}
