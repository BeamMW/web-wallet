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
  sbbs?: string | null;
}

const FullAddressWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AddressCard = styled.div`
  position: relative;
  border: 1px solid var(--cp-line);
  clip-path: var(--cp-clip);
  padding: 14px 46px 14px 14px;

  .title {
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.16em;
    color: var(--cp-muted);
    text-transform: uppercase;
    text-align: left;
  }
  .address-information {
    margin-top: 8px;
    text-align: left;
    word-break: break-all;
    font-family: var(--font-mono);
    font-size: 12px;
    line-height: 1.5;
    color: var(--cp-text);
  }
  .hint {
    margin-top: 10px;
    text-align: left;
    font-family: var(--font-mono);
    font-size: 10px;
    line-height: 1.4;
    color: var(--cp-muted);
  }
  > button {
    position: absolute;
    top: 12px;
    right: 12px;
    margin: 0 !important;
  }
`;

const FullAddress = ({
  pallete,
  onClose,
  addressData,
  address,
  hint,
  isMaxAnonymity,
  isOffline,
  sbbs,
}: FullAddressProps) => {
  let hintItem = hint;
  const isMaxPrivacy = addressData?.type === 'max_privacy';

  const copyAddress = async () => {
    toast('Address copied to clipboard');
    await copyToClipboard(address);
  };

  const copySbbs = async () => {
    toast('SBBS copied to clipboard');
    await copyToClipboard(sbbs);
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
      return 'Regular Address';
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
        <AddressCard>
          {(showAddress() || getTitle() === 'ONLINE ADDRESS' || (getTitle() === 'Regular Address' && !isOffline)) && (
            <div className="title">{getTitle() === 'ONLINE ADDRESS' ? 'Online (SBBS) address' : 'Address'}</div>
          )}
          <div className="address-information">{address}</div>
          <Button variant="icon" pallete="white" icon={CopySmallIcon} onClick={copyAddress} />
          {(showAddress() || addressData?.type === 'max_privacy' || (getTitle() === 'Regular Address' && !isOffline))
            && hintItem && <div className="hint">{hintItem}</div>}
        </AddressCard>

        {sbbs && address !== sbbs && !isOffline && (
          <AddressCard>
            <div className="title">Online (SBBS) address</div>
            <div className="address-information">{sbbs}</div>
            <Button variant="icon" pallete="white" icon={CopySmallIcon} onClick={copySbbs} />
          </AddressCard>
        )}

        <Button icon={CopySmallIcon} pallete={pallete} onClick={copyAndClose}>
          copy address and close
        </Button>
      </FullAddressWrapper>
    </Window>
  );
};

export default FullAddress;
