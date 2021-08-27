import React, { useState } from 'react';
import { useStore } from 'effector-react';

import { $balance } from '@state/portfolio';
import { GROTHS_IN_BEAM, FEE_DEFAULT, setView, View } from '@state/shared';
import { debounce } from '@core/utils';
import { calculateChange, sendTransaction } from '@core/api';
import { Window, Select, Section, Input, Button } from 'app/uikit';
import AssetInput from './asset-input';

import ArrowIcon from '@icons/icon-arrow.svg';

const calculateChangeDebounced = debounce(calculateChange, 300);

const Send = () => {
  const [amount, setAmount] = useState(0);
  const [selected, setSelected] = useState(0);

  const balance = useStore($balance);

  const handleAmountChange: React.ChangeEventHandler<HTMLInputElement> = ({
    target,
  }) => {
    const value = parseFloat(target.value);
    const asset = balance.find(({ asset_id }) => asset_id === selected);
    const next = Math.min(value, asset.available);

    setAmount(next);
    calculateChangeDebounced({
      amount: next * GROTHS_IN_BEAM,
      fee: FEE_DEFAULT,
      asset_id: selected,
      is_push_transaction: false,
    });
  };

  const handleAssetChange: React.ChangeEventHandler<HTMLInputElement> = ({
    target,
  }) => {
    const value = parseInt(target.value);
    setSelected(value);
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const address = data.get('address') as string;

    sendTransaction({
      value: amount * GROTHS_IN_BEAM,
      address,
    });
  };

  const handleSelect = (index: number) => {
    console.log(index);
  };

  const assets = balance.map(({ name }) => name);

  return (
    <Window
      title="Send"
      color="purple"
      onBackClick={() => setView(View.PORTFOLIO)}
    >
      <form onSubmit={handleSubmit}>
        <Section title="Send to" variant="gray">
          <Input variant="gray" />
        </Section>
        <Section title="Amount" variant="gray">
          <AssetInput assets={assets} onSelect={handleSelect} />
        </Section>
        <Section title="Comment" variant="gray">
          <Input variant="gray" />
        </Section>
        <Button color="purple" icon={ArrowIcon} type="submit">
          next
        </Button>
      </form>
    </Window>
  );
};

export default Send;
