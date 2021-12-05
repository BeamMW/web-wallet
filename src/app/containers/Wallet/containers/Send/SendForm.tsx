/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useStore } from 'effector-react';

import {
  AmountInput, Button, Input, Rate, Section, Title, Window,
} from '@app/shared/components';

import { ArrowRightIcon, ArrowUpIcon } from '@app/shared/icons';

import { styled } from '@linaria/react';
import LabeledToggle from '@app/shared/components/LabeledToggle';
import { css } from '@linaria/core';
import { fromGroths, isNil, truncate } from '@core/utils';
import { useFormik } from 'formik';

import { AddressLabel, AddresssTip, ASSET_BLANK } from '@app/containers/Wallet/constants';
import { useDispatch, useSelector } from 'react-redux';
import { validateSendAddress } from '@app/containers/Wallet/store/actions';
import { selectAssets, selectSendAddressData, selectSendFee } from '@app/containers/Wallet/store/selectors';
import { TransactionAmount } from '@app/containers/Wallet/interfaces';
import { $amountError, onFormSubmit } from '../../old-store/model-send';

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
}

const validate = async (values: SendFormData) => {
  const errors: any = {};

  if (!values.address.length) {
    errors.address = 'Required';
    return errors;
  }

  if (!values.send_amount.amount.length) {
    errors.send_amount = 'Required';
    return errors;
  }

  return errors;
};
// todo validation on amount change
// todo move send confirm here
const SendForm = () => {
  const dispatch = useDispatch();
  const [validateInterval, setValidateInterval] = useState<null | NodeJS.Timer>(null);
  const [hints, setHints] = useState({
    label: '',
    warning: '',
  });
  const [selected, setSelected] = useState(ASSET_BLANK);

  const formik = useFormik<SendFormData>({
    initialValues: {
      address: '',
      offline: false,
      send_amount: {
        amount: '',
        asset_id: 0,
      },
    },
    validateOnMount: true,
    enableReinitialize: true,
    validate,
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
  });
  const assets = useSelector(selectAssets());
  const addressData = useSelector(selectSendAddressData());
  const fee = useSelector(selectSendFee());

  const {
    values, setFieldValue, setFieldError, errors,
  } = formik;

  const { type: addressType } = addressData;

  useEffect(() => {
    if (values.address.length) {
      if (!addressData.is_valid || addressData.type === 'unknown') {
        setFieldError('address', AddressLabel.ERROR);

        setHints({
          label: AddressLabel.ERROR,
          warning: '',
        });

        return;
      }
      if (addressData.type === 'max_privacy') {
        setFieldError('address', AddressLabel.MAX_PRIVACY);

        setHints({
          label: AddressLabel.MAX_PRIVACY,
          warning: AddresssTip.MAX_PRIVACY,
        });

        return;
      }

      if (values.offline) {
        const warning = addressData.payments === 1
          ? 'transactions left.'
          : 'transaction left. Ask receiver to come online to support more offline transaction.';

        const label = `${AddressLabel.OFFLINE} ${addressData.payments} ${warning}`;
        setFieldError('address', label);

        setHints({
          label,
          warning: AddresssTip.OFFLINE,
        });
        return;
      }

      setHints({
        label: AddressLabel.REGULAR,
        warning: AddresssTip.REGULAR,
      });
    }
    setHints({
      label: '',
      warning: '',
    });
  }, [addressData, values, setFieldError]);

  const amountError = useStore($amountError);

  const groths = fromGroths(selected.available);

  const validateAddressHandler = (address: string) => {
    if (validateInterval) {
      clearTimeout(validateInterval);
      setValidateInterval(null);
    }
    const i = setTimeout(() => {
      dispatch(validateSendAddress.request(address));
    }, 200);
    setValidateInterval(i);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFieldValue('address', value);

    if (value.length) validateAddressHandler(value);
  };

  const handleAssetChange = (e: TransactionAmount) => {
    setFieldValue('send_amount', e);
    const asset = assets.find(({ asset_id: id }) => id === e.asset_id) ?? ASSET_BLANK;
    setSelected(asset);
    // todo validation
  };

  const handleMaxAmount = () => {
    const { available } = selected;
    const { send_amount } = values;

    const total = send_amount.asset_id === 0 ? Math.max(available - fee, 0) : available;
    const new_amount = fromGroths(total).toString();

    setFieldValue('send_amount', { amount: new_amount, asset_id: send_amount.asset_id });

    // todo validation
  };

  return (
    <Window title="Send" pallete="purple">
      <form onSubmit={onFormSubmit}>
        <Section title="Send to" variant="gray">
          <Input
            variant="gray"
            label={hints.label}
            valid={values.address.length ? !errors.address : true}
            placeholder="Paste recipient address here"
            value={values.address}
            onInput={handleAddressChange}
          />
        </Section>
        {addressType === 'offline' && (
          <Section title="Transaction Type" variant="gray">
            <LabeledToggle
              left="Online"
              right="Offline"
              value={values.offline}
              onChange={(e) => setFieldValue('offline', e)}
            />
          </Section>
        )}
        <Section title="Amount" variant="gray">
          <AmountInput
            value={values.send_amount.amount}
            asset_id={values.send_amount.asset_id}
            error={amountError}
            onChange={(e) => handleAssetChange(e)}
          />
          <Title variant="subtitle">Available</Title>
          {`${groths} ${truncate(selected.metadata_pairs.N)}`}
          {selected.asset_id === 0 && isNil(amountError) && <Rate value={groths} />}
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
        <WarningStyled>{hints.warning}</WarningStyled>
        <Button pallete="purple" icon={ArrowRightIcon} type="submit" disabled={!formik.isValid}>
          next
        </Button>
      </form>
    </Window>
  );
};

export default SendForm;
