import { createEvent, Event } from 'effector';
import React from 'react';

export const isNil = (value: any) => value == null;

export const getInputValue = ({ target }: React.ChangeEvent<HTMLInputElement>) => target.value;

export const preventDefault = (event: React.SyntheticEvent) => event.preventDefault();

export const curry = <T>(event: Event<T>, payload: T) => event.prepend(() => payload);

type ReactChangeEvent = React.ChangeEvent<HTMLInputElement>;

type Handler<T = unknown> = (value: T) => void;

export const makeOnChange = (event: Event<string> | Handler<string>) => {
  const onChange = createEvent<ReactChangeEvent>();
  onChange.map<string>(getInputValue).watch(event);
  return onChange;
};

type ReactMouseEvent = React.MouseEvent<HTMLElement>;

export const makeOnClick = (event: Event<unknown>) => {
  const onClick = createEvent<ReactMouseEvent>();
  onClick.watch(event);
  return onClick;
};

type ReactFormEvent = React.FormEvent<HTMLFormElement>;

export const makeOnSubmit = (event: Event<unknown> | Handler) => {
  const onSubmit = createEvent<ReactFormEvent>();
  onSubmit.map<void>(preventDefault).watch(event);
  return onSubmit;
};
