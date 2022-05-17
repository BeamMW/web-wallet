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
    margin-bottom: 10px;
    text-align: left;
  }
  .address-information {
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
  pallete, onClose, addressData, address, hint,
}: FullAddressProps) => {
  const isMaxPrivacy = addressData?.type === 'max_privacy';

  const copyAddress = async () => {
    toast('Address copied to clipboard');
    await copyToClipboard(address);
  };

  const copyAndClose = async () => {
    await copyAddress();
    onClose();
  };

  return (
    <Window pallete={pallete} onPrevious={onClose} title={isMaxPrivacy ? 'Max anonomity' : 'Address Details'}>
      <FullAddressWrapper>
        <AddressInformationWrapper>
          <div className="title">Address</div>
          <div className="address-information">{address}</div>
          <Button variant="icon" pallete="white" icon={CopySmallIcon} onClick={copyAddress} />
          <div className="hint">{hint}</div>
        </AddressInformationWrapper>
        <Button icon={CopySmallIcon} pallete={pallete} onClick={copyAndClose}>
          copy address and close
        </Button>
      </FullAddressWrapper>
    </Window>
  );
};

export default FullAddress;
