import produce from 'immer';
import { ActionType, createReducer } from 'typesafe-actions';

import { Asset } from '@core/types';
import { FEE_DEFAULT } from '@app/containers/Wallet/constants';
import { WalletStateType } from '../interfaces';
import * as actions from './actions';

type Action = ActionType<typeof actions>;

const META_BLANK: Partial<Asset> = {
  metadata_pairs: {
    N: '',
    SN: '',
    UN: '',
  },
};

const META_BEAM: Partial<Asset> = {
  metadata_pairs: {
    N: 'BEAM',
    SN: 'BEAM',
    UN: 'BEAM',
  },
};

function getMetadata(assets: Asset[], id: number): Partial<Asset> {
  if (id === 0) {
    return META_BEAM;
  }

  return assets.find(({ asset_id }) => asset_id === id) ?? META_BLANK;
}

const initialState: WalletStateType = {
  totals: [],
  assets: [],
  assets_total: [],
  rate: 0,
  receive_amount: {
    amount: '',
    asset_id: 0,
  },
  address: '',
  send_address_data: {
    type: null,
    amount: null,
    is_mine: null,
    is_valid: null,
    asset_id: null,
    payments: null,
  },
  send_fee: FEE_DEFAULT,
  change: 0,
  asset_change: 0,
  is_send_ready: false,
};

const handleAssets = (state: WalletStateType) => {
  const { totals, assets } = state;

  return totals && totals.length
    ? totals?.map((data) => {
      const target = getMetadata(assets, data.asset_id);
      return {
        ...data,
        ...target,
      };
    })
    : [];
};

const reducer = createReducer<WalletStateType, Action>(initialState)
  .handleAction(actions.setTotals, (state, action) => produce(state, (nexState) => {
    nexState.totals = action.payload;
    nexState.assets_total = handleAssets(nexState);
  }))
  .handleAction(actions.setAssets, (state, action) => produce(state, (nexState) => {
    nexState.assets = action.payload;
    nexState.assets_total = handleAssets(nexState);
  }))
  .handleAction(actions.loadRate.success, (state, action) => produce(state, (nexState) => {
    nexState.rate = action.payload;
  }))
  .handleAction(actions.setReceiveAmount, (state, action) => produce(state, (nexState) => {
    nexState.receive_amount = action.payload;
  }))
  .handleAction(actions.generateAddress.success, (state, action) => produce(state, (nexState) => {
    nexState.address = action.payload;
  }))
  .handleAction(actions.resetReceive, (state) => produce(state, (nexState) => {
    nexState.receive_amount = {
      amount: '',
      asset_id: 0,
    };
    nexState.address = '';
  }))
  .handleAction(actions.validateSendAddress.success, (state, action) => produce(state, (nexState) => {
    nexState.send_address_data = action.payload;
  }))
  .handleAction(actions.validateAmount.success, (state, action) => produce(state, (nexState) => {
    nexState.send_fee = action.payload.explicit_fee;
    nexState.change = action.payload.change;
    nexState.asset_change = action.payload.asset_change;
  }))
  .handleAction(actions.resetSendData, (state) => produce(state, (nexState) => {
    nexState.address = '';
    nexState.send_address_data = {
      type: null,
      amount: null,
      is_mine: null,
      is_valid: null,
      asset_id: null,
      payments: null,
    };
    nexState.send_fee = FEE_DEFAULT;
    nexState.change = 0;
    nexState.is_send_ready = false;
  }))
  .handleAction(actions.setSendTransactionState, (state, action) => produce(state, (nexState) => {
    nexState.is_send_ready = action.payload;
  }));

export { reducer as WalletReducer };
