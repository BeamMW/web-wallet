import React from 'react';

import { Button, Footer } from 'app/uikit';
import { useStore } from 'effector-react';
import SeedList from './SeedList';
import { $errors, $valid, onInput } from './model';

interface SeedInputProps {
  onSubmit: React.FormEventHandler;
}

const SeedRestore: React.FC<SeedInputProps> = ({ onSubmit }) => {
  const errors = useStore($errors);
  const valid = useStore($valid);

  return (
    <form autoComplete="off" onSubmit={onSubmit}>
      <SeedList data={errors} onInput={onInput} />
      <Footer>
        <Button type="submit" disabled={!valid}>
          Submit
        </Button>
      </Footer>
    </form>
  );
};

export default SeedRestore;
