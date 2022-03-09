import React from 'react';
import { Button } from '@app/shared/components/index';
import { ArrowDownIcon, ArrowUpIcon } from '@app/shared/icons';
import { ROUTES } from '@app/shared/constants';
import { styled } from '@linaria/react';
import { useNavigate } from 'react-router-dom';

const ActionsStyled = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 10px -14px 0;

  > button {
    margin: 0 4px !important;
  }
`;

export const WalletActions = () => {
  const navigate = useNavigate();
  return (
    <ActionsStyled>
      <Button pallete="purple" icon={ArrowUpIcon} onClick={() => navigate(ROUTES.WALLET.SEND)}>
        send
      </Button>
      <Button pallete="blue" icon={ArrowDownIcon} onClick={() => navigate(ROUTES.WALLET.RECEIVE)}>
        receive
      </Button>
    </ActionsStyled>
  );
};
export default WalletActions;
