/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useMemo, useState } from 'react';

import {
  AmountInput, Button, Input, Rate, Section, Title, Window,
} from '@app/shared/components';

import { ArrowRightIcon, ArrowUpIcon } from '@app/shared/icons';

import { styled } from '@linaria/react';
import LabeledToggle from '@app/shared/components/LabeledToggle';
import { css } from '@linaria/core';
import {
  fromGroths, isNil, toGroths, truncate,
} from '@core/utils';
import { useFormik } from 'formik';

import {
  AddressLabel, AddressTip, AmountError, ASSET_BLANK,
} from '@app/containers/Wallet/constants';
import { useDispatch, useSelector } from 'react-redux';
import { validateAmount, validateSendAddress } from '@app/containers/Wallet/store/actions';
import { selectAssets, selectSendAddressData, selectSendFee } from '@app/containers/Wallet/store/selectors';
import { AssetTotal, TransactionAmount } from '@app/containers/Wallet/interfaces';
import { AddressData } from '@core/types';
import { onFormSubmit } from '../../old-store/model-send';

const WarningStyled = styled.div`
  margin: 30px -20px;
  font-family: 'SFProDisplay';
  font-style: italic;
  color: var(--color-gray);
`;

const maxButtonStyle = css`
  position: absolute;
  right: 20px;
  top: 138px;
`;

interface Hints {
  label: string;
  warning: string;
}

interface SendFormData {
  address: string;
  offline: boolean;
  send_amount: {
    amount: '';
    asset_id: 0;
  };

  misc: {
    beam: AssetTotal;
    selected: AssetTotal;
    fee: number;
    addressData: AddressData;
  };
}

const validate = async (values: SendFormData, setHint: (string) => void) => {
  const errors: any = {};
  const {
    addressData, selected, beam, fee,
  } = values.misc;

  if (!values.address.length) {
    errors.address = '';
    return errors;
  }

  if (!addressData.is_valid || addressData.type === 'unknown') {
    errors.address = AddressLabel.ERROR;
    return errors;
  }

  if (addressData.type === 'max_privacy') {
    errors.address = AddressLabel.MAX_PRIVACY;
    return errors;
  }

  if (values.offline) {
    const warning = addressData.payments === 1
      ? 'transactions left.'
      : 'transaction left. Ask receiver to come online to support more offline transaction.';

    const label = `${AddressLabel.OFFLINE} ${addressData.payments} ${warning}`;

    setHint(label);
  } else {
    setHint('');
  }

  if (!values.send_amount.amount.length) {
    errors.send_amount = '';
    return errors;
  }

  const { send_amount } = values;
  const { available } = selected;
  const value = toGroths(parseFloat(send_amount.amount));

  const total = value + fee;

  if (beam.available < fee) {
    errors.send_amount = AmountError.FEE;
    return errors;
  }

  if (total > available) {
    const max = fromGroths(available - fee);
    errors.send_amount = `${AmountError.AMOUNT} ${max} ${truncate(selected.metadata_pairs.UN)}`;
    return errors;
  }

  return errors;
};

// todo move send confirm here
const SendForm = () => {
  const dispatch = useDispatch();
  const [validateInterval, setValidateInterval] = useState<null | NodeJS.Timer>(null);
  const [validateAmountInterval, setValidateAmountInterval] = useState<null | NodeJS.Timer>(null);
  const [warning, setWarning] = useState('');
  const [hint, setHint] = useState('');
  const [selected, setSelected] = useState(ASSET_BLANK);

  const assets = useSelector(selectAssets());
  const addressData = useSelector(selectSendAddressData());
  const fee = useSelector(selectSendFee());

  const beam = useMemo(() => assets.find((a) => a.asset_id === 0), [assets]);

  const formik = useFormik<SendFormData>({
    initialValues: {
      address: '',
      offline: false,
      send_amount: {
        amount: '',
        asset_id: 0,
      },
      misc: {
        addressData,
        fee,
        beam,
        selected,
      },
    },
    isInitialValid: false,
    validate: (e) => validate(e, setHint),
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
  });

  const {
    values, setFieldValue, setFieldError, errors,
  } = formik;

  const { type: addressType } = addressData;

  useEffect(() => {
    const currentSelected = JSON.stringify(selected);
    const defaultStateSelected = JSON.stringify(ASSET_BLANK);
    if (currentSelected === defaultStateSelected) {
      setSelected(beam);
      setFieldValue('misc.selected', beam, true);
    }
  }, [selected, beam, setFieldValue]);

  useEffect(() => {
    if (values.address.length) {
      setFieldValue('misc.addressData', addressData, true);
      if (addressData.amount && addressData.asset_id) {
        setFieldValue('send_amount', { amount: addressData.amount, asset_id: addressData.asset_id }, true);
      }

      if (addressData.type === 'max_privacy') {
        setWarning(AddressTip.MAX_PRIVACY);
        return;
      }

      if (values.offline) {
        setWarning(AddressTip.OFFLINE);
      }
    }
  }, [addressData, values, setFieldValue]);

  const groths = fromGroths(selected.available);

  const validateAmountHandler = () => {
    const { send_amount, offline } = values;

    if (validateInterval) {
      clearTimeout(validateInterval);
      setValidateAmountInterval(null);
    }
    const i = setTimeout(() => {
      dispatch(
        validateAmount.request({
          amount: Number(send_amount.amount),
          asset_id: send_amount.asset_id,
          is_push_transaction: offline,
        }),
      );
    }, 200);
    setValidateAmountInterval(i);
  };

  const validateAddressHandler = (address: string) => {
    if (validateAmountInterval) {
      clearTimeout(validateAmountInterval);
      setValidateInterval(null);
    }
    const i = setTimeout(() => {
      dispatch(validateSendAddress.request(address));
    }, 200);
    setValidateInterval(i);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFieldValue('address', value, true);
    if (value.length) validateAddressHandler(value);
  };

  const handleAssetChange = (e: TransactionAmount) => {
    setFieldValue('send_amount', e, true);
    const asset = assets.find(({ asset_id: id }) => id === e.asset_id) ?? ASSET_BLANK;
    setSelected(asset);
    setFieldValue('misc.selected', asset, true);
    validateAmountHandler();
  };

  const handleMaxAmount = () => {
    const { available } = selected;
    const { send_amount } = values;

    const total = send_amount.asset_id === 0 ? Math.max(available - fee, 0) : available;
    const new_amount = fromGroths(total).toString();

    setFieldValue('send_amount', { amount: new_amount, asset_id: send_amount.asset_id }, true);
    validateAmountHandler();
  };

  const handleOffline = (e: boolean) => {
    setFieldValue('offline', e, true);
    validateAmountHandler();
  };

  console.log(errors);

  return (
    <Window title="Send" pallete="purple">
      <form onSubmit={onFormSubmit}>
        <Section title="Send to" variant="gray">
          <Input
            variant="gray"
            label={errors.address ? errors.address : hint || (values.address.length > 0 ? 'Regular address' : '')}
            valid={values.address.length ? !errors.address : true}
            placeholder="Paste recipient address here"
            value={values.address}
            onInput={handleAddressChange}
          />
        </Section>
        {addressType === 'offline' && (
          <Section title="Transaction Type" variant="gray">
            <LabeledToggle left="Online" right="Offline" value={values.offline} onChange={(e) => handleOffline(e)} />
          </Section>
        )}
        <Section title="Amount" variant="gray">
          <AmountInput
            value={values.send_amount.amount}
            asset_id={values.send_amount.asset_id}
            error={errors.send_amount?.toString()}
            onChange={(e) => handleAssetChange(e)}
          />
          <Title variant="subtitle">Available</Title>
          {`${groths} ${truncate(selected.metadata_pairs.N)}`}
          {selected.asset_id === 0 && !errors.send_amount && <Rate value={groths} />}
          {groths > 0 && (
            <Button
              icon={ArrowUpIcon}
              variant="link"
              pallete="purple"
              className={maxButtonStyle}
              onClick={handleMaxAmount}
            >
              max
            </Button>
          )}
        </Section>
        {/* <Section title="Comment" variant="gray" collapse>
          <Input
            variant="gray"
            value={comment}
            onInput={onCommentChange}
          />
        </Section> */}
        <WarningStyled>{warning}</WarningStyled>
        <Button pallete="purple" icon={ArrowRightIcon} type="submit" disabled={!formik.isValid}>
          next
        </Button>
      </form>
    </Window>
  );
};

export default SendForm;
