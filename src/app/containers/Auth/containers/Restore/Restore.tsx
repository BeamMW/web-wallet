import React, { useState } from 'react';

import { setSeed } from '@model/base';
import { Button, Footer, Window } from '@app/shared/components';

import { ROUTES } from '@app/shared/constants';
import { useNavigate } from 'react-router-dom';
import { SeedList } from '@app/containers/Auth/components';

import { useDispatch, useSelector } from 'react-redux';
import { setSeedResult, updateSeedList } from '@app/containers/Auth/store/actions';
import { selectSeedCache, selectSeedErrors } from '@app/containers/Auth/store/selectors';

const Restore: React.FC = () => {
  const [interval, updateInterval] = useState<null | NodeJS.Timer>(null);

  const dispatch = useDispatch();

  const errors = useSelector(selectSeedErrors());
  const cache = useSelector(selectSeedCache());

  const valid = !errors.filter((v) => !v).length;

  const navigate = useNavigate();

  const handleSubmit: React.ChangeEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const values = data.values() as IterableIterator<string>;

    const seed = Array.from(values).reduce((result, value, index) => (index === 0 ? value : `${result} ${value}`));

    setSeed([seed, true]);
    dispatch(setSeedResult(seed));
    navigate(ROUTES.AUTH.SET_PASSWORD);
  };

  const seedListHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (interval) {
      clearTimeout(interval);
      updateInterval(null);
    }
    const i = setTimeout(() => {
      dispatch(updateSeedList.request(e));
    }, 200);
    updateInterval(i);
  };

  return (
    <Window title="Restore wallet">
      <p>Type in your seed phrase</p>
      <form autoComplete="off" onSubmit={handleSubmit}>
        <SeedList data={errors} initial={cache} onInput={(e) => seedListHandler(e)} />
        <Footer>
          <Button type="submit" disabled={!valid}>
            Submit
          </Button>
        </Footer>
      </form>
    </Window>
  );
};

export default Restore;
