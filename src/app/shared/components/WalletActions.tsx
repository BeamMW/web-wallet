import React from 'react';
import { Button } from '@app/shared/components/index';
import { ArrowDownIcon, ArrowUpIcon, ArrowsTowards } from '@app/shared/icons';
import { ROUTES } from '@app/shared/constants';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setSelectedAssetId } from '@app/containers/Wallet/store/actions';

const ActionsStyled = styled.div`
  display: flex;
  justify-content: center;
  gap: 9px;
  margin: 10px 0 0;

  > button {
    margin: 0 !important;
  }

  &.compact {
    justify-content: center;
    margin: 0;
  }
`;

// Make the label visually centered even with an icon by absolutely positioning the icon.
const swapButtonFixClass = css`
  position: relative !important;
  /* Keep label centered while reserving space for the left icon. */
  padding-left: 34px !important;
  padding-right: 34px !important;

  > svg {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    margin-right: 0 !important;
    width: 14px;
    height: 14px;
    display: block;
    pointer-events: none;
  }
`;

interface WalletActionsProps {
  selected_asset_id?: number;
  className?: string;
  buttonClassName?: string;
}

export const WalletActions = ({ selected_asset_id, className, buttonClassName }: WalletActionsProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const navigateToSend = () => {
    if (selected_asset_id) {
      dispatch(setSelectedAssetId(selected_asset_id));
    }
    navigate(ROUTES.WALLET.SEND);
  };

  const navigateToSwap = () => {
    if (selected_asset_id) {
      dispatch(setSelectedAssetId(selected_asset_id));
    }
    navigate(ROUTES.SWAP.BASE);
  };

  const navigateToReceive = () => {
    if (selected_asset_id) {
      dispatch(setSelectedAssetId(selected_asset_id));
    }
    navigate(ROUTES.WALLET.RECEIVE);
  };

  return (
    <ActionsStyled className={className}>
      <Button className={buttonClassName} pallete="purple" icon={ArrowUpIcon} onClick={() => navigateToSend()}>
        send
      </Button>
      <Button
        className={[buttonClassName, swapButtonFixClass].filter(Boolean).join(' ')}
        pallete="green"
        icon={ArrowsTowards}
        onClick={() => navigateToSwap()}
      >
        swap
      </Button>
      <Button className={buttonClassName} pallete="blue" icon={ArrowDownIcon} onClick={() => navigateToReceive()}>
        receive
      </Button>
    </ActionsStyled>
  );
};
export default WalletActions;
