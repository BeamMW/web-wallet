import React, { useState } from 'react';
import { useStore } from 'effector-react';

import { $balance } from '@state/portfolio';
import { GROTHS_IN_BEAM, FEE_DEFAULT, setView, View } from '@state/shared';
import { debounce } from '@core/utils';
import { calculateChange, sendTransaction } from '@core/api';

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

  const handleBackClick: React.MouseEventHandler = () => {
    setView(View.PORTFOLIO);
  };

  return (
    <div>
      <h1>Send</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <ul>
            {balance.map(({ name, available, asset_id }) => (
              <li key={asset_id}>
                <label>
                  {name} {available / GROTHS_IN_BEAM}
                </label>
                <input
                  id={`asset${asset_id}`}
                  value={asset_id}
                  type="radio"
                  name="asset"
                  checked={selected === asset_id}
                  onChange={handleAssetChange}
                />
              </li>
            ))}
          </ul>
        </div>
        <div>
          Address: <input type="text" name="address" />
        </div>
        <div>
          Amount:
          <input
            type="text"
            name="sum"
            value={amount}
            onChange={handleAmountChange}
          />
        </div>
        <button type="button" onClick={handleBackClick}>
          Back
        </button>
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Send;
