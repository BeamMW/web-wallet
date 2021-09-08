import { createEvent, Event } from 'effector';
import React from 'react';

export const isNil = (value: any) => value == null;

export const getInputValue = ({ target }: React.ChangeEvent<HTMLInputElement>) => target.value;

export const preventDefault = (event: React.SyntheticEvent) => event.preventDefault();

export const curry = <T>(event: Event<T>, payload: T) => event.prepend(() => payload);

type ReactChangeEvent = React.ChangeEvent<HTMLInputElement>;

type Callback<T = unknown> = (value: T) => void;

export const makeOnChange = (event: Event<string> | Callback<string>) => {
  const onChange = createEvent<ReactChangeEvent>();
  onChange.map<string>(getInputValue).watch(event);
  return onChange;
};

export const makePrevented = (callback: Event<void> | Callback<void>) => {
  const clock = createEvent<React.SyntheticEvent>();

  clock.watch((event) => {
    if (!isNil) {
      event.preventDefault();
    }

    callback();
  });

  return clock;
};
