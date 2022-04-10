import React from 'react';
import { Button } from '@app/shared/components/index';
import { ArrowDownIcon, ArrowUpIcon } from '@app/shared/icons';
import { ROUTES } from '@app/shared/constants';
import { styled } from '@linaria/react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setSelectedAssetId } from '@app/containers/Wallet/store/actions';

const ActionsStyled = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 10px -14px 0;

  > button {
    margin: 0 4px !important;
  }
`;

interface WalletActionsProps {
  selected_asset_id?: number;
}

export const WalletActions = ({ selected_asset_id }: WalletActionsProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const navigateToSend = () => {
    if (selected_asset_id) {
      dispatch(setSelectedAssetId(selected_asset_id));
    }
    navigate(ROUTES.WALLET.SEND);
  };

  const navigateToReceive = () => {
    if (selected_asset_id) {
      dispatch(setSelectedAssetId(selected_asset_id));
    }
    navigate(ROUTES.WALLET.RECEIVE);
  };

  return (
    <ActionsStyled>
      <Button pallete="purple" icon={ArrowUpIcon} onClick={() => navigateToSend()}>
        send
      </Button>
      <Button pallete="blue" icon={ArrowDownIcon} onClick={() => navigateToReceive()}>
        receive
      </Button>
    </ActionsStyled>
  );
};
export default WalletActions;
