/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { useStore } from 'effector-react';

import { setView, View } from '@state/shared';
import { calculateChange, sendTransaction } from '@core/api';
import {
  Window, Section, Input, Button,
} from 'app/uikit';
import ArrowIcon from '@icons/icon-arrow.svg';

import Amount from './Amount';

const Send = () => {
  const [step, setStep] = useState(0);

  const handleConfirmClick: React.MouseEventHandler = () => {
    // event.preventDefault();

    // const data = new FormData(event.currentTarget);
    // const address = data.get('address') as string;

    // sendTransaction({
    //   value: amount * GROTHS_IN_BEAM,
    //   address,
    // });
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = () => {
    setStep(1);
  };

  switch (step) {
    case 1:
      return (
        <Window
          title="Send"
          pallete="purple"
          onBackClick={() => setStep(0)}
        >
          <Button pallete="purple" icon={ArrowIcon} onClick={handleConfirmClick}>
            next
          </Button>
        </Window>
      );
    default:
      return (
        <Window
          title="Send"
          pallete="purple"
          onBackClick={() => setView(View.PORTFOLIO)}
        >
          <form onSubmit={handleSubmit}>
            <Section title="Send to" variant="gray">
              <Input variant="gray" />
            </Section>
            <Amount />
            <Section title="Comment" variant="gray">
              <Input variant="gray" />
            </Section>
            <Button pallete="purple" icon={ArrowIcon} type="submit">
              next
            </Button>
          </form>
        </Window>
      );
  }
};

export default Send;
