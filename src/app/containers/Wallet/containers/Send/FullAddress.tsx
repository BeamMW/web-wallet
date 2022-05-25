import React from 'react';
import { styled } from '@linaria/react';
import { Button, Window } from '@app/shared/components';
import { AddressData } from '@core/types';
import { CopySmallIcon } from '@app/shared/icons';
import { toast } from 'react-toastify';
import { copyToClipboard } from '@core/utils';

interface FullAddressProps {
  addressData?: AddressData;
  pallete: 'default' | 'blue' | 'purple';
  onClose: () => void;
  address: string;
  hint?: string;
  isMaxAnonymity?: boolean;
  isOffline?: boolean;
}

const FullAddressWrapper = styled.div`
  position: relative;
  height: 70vh;
  margin: 0 auto;
  > button {
    display: flex !important;
    position: absolute;
    margin-left: auto;
    margin-right: auto;
    left: 0;
    right: 0;
    bottom: -25px;
  }
`;

const AddressInformationWrapper = styled.div`
  position: relative;
  .title {
    opacity: 0.5;
    font-size: 14px;
    font-weight: bold;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: 1px;
    color: #fff;
    text-transform: uppercase;
    text-align: left;
  }
  .address-information {
    margin-top: 10px;
    white-space: initial;
    width: 300px;
    text-align: left;
    word-wrap: break-word;
    font-size: 14px;
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: normal;
    color: #fff;
  }
  button {
    position: absolute;
    top: 25px;
    right: -20px;

    &.no-title {
      top: 0;
    }
  }
  .hint {
    margin-top: 10px;
    opacity: 0.5;
    font-size: 14px;
    font-weight: normal;
    font-stretch: normal;
    font-style: italic;
    line-height: normal;
    letter-spacing: normal;
    text-align: center;
    color: #fff;
  }
`;

const FullAddress = ({
  pallete, onClose, addressData, address, hint, isMaxAnonymity, isOffline,
}: FullAddressProps) => {
  let hintItem = hint;
  const isMaxPrivacy = addressData?.type === 'max_privacy';

  const copyAddress = async () => {
    toast('Address copied to clipboard');
    await copyToClipboard(address);
  };

  const copyAndClose = async () => {
    await copyAddress();
    onClose();
  };

  const getTitle = () => {
    if (addressData?.type === 'offline') {
      if (!isOffline) {
        hintItem = 'Regular address includes both online and offline addresses.';
      }
      return isOffline ? 'Public offline' : 'Regular Address';
    }
    if (addressData?.type === 'regular') {
      return 'ONLINE ADDRESS';
    }
    if (addressData?.type === 'public_offline') {
      return 'Public offline';
    }
    if (isMaxPrivacy) {
      return 'MAXIMUM ANONYMITY';
    }
    if (isMaxAnonymity) {
      return 'MAXIMUM ANONYMITY';
    }

    hintItem = 'Regular address includes both online and offline addresses.';
    return 'Regular Address';
  };

  const showAddress = () => {
    if (isMaxAnonymity) return false;
    if (isMaxPrivacy) return false;
    if (addressData?.type === 'public_offline') return false;
    if (addressData?.type === 'offline') return false;
    if (addressData?.type === 'regular') return false;

    return true;
  };

  return (
    <Window pallete={pallete} onPrevious={onClose} title={getTitle()}>
      <FullAddressWrapper>
        <AddressInformationWrapper>
          {(showAddress() || getTitle() === 'ONLINE ADDRESS') && (
            <div className="title">{getTitle() === 'ONLINE ADDRESS' ? 'ONLINE (SBBS) ADDRESS' : 'Address'}</div>
          )}
          <div className="address-information">{address}</div>
          <Button
            className={showAddress() || getTitle() === 'ONLINE ADDRESS' ? '' : 'no-title'}
            variant="icon"
            pallete="white"
            icon={CopySmallIcon}
            onClick={copyAddress}
          />
          <div className="hint">{showAddress() || addressData?.type === 'max_privacy' ? hintItem : ''}</div>
        </AddressInformationWrapper>
        <Button icon={CopySmallIcon} pallete={pallete} onClick={copyAndClose}>
          copy address and close
        </Button>
      </FullAddressWrapper>
    </Window>
  );
};

export default FullAddress;
