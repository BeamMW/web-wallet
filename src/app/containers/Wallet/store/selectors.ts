import { createSelector } from 'reselect';
import { AppState } from '../../../shared/interface';

const selectWallet = (state: AppState) => state.wallet;

export const selectAssets = () => createSelector(selectWallet, (state) => state.assets_total);

export const selectRate = () => createSelector(selectWallet, (state) => state.rate);

export const selectReceiveAmount = () => createSelector(selectWallet, (state) => state.receive_amount);

export const selectAddress = () => createSelector(selectWallet, (state) => state.address);

export const selectSendAddressData = () => createSelector(selectWallet, (state) => state.send_address_data);

export const selectSendFee = () => createSelector(selectWallet, (state) => state.send_fee);

export const selectChange = () => createSelector(selectWallet, (state) => state.change);
export const selectAssetChange = () => createSelector(selectWallet, (state) => state.asset_change);

export const selectIsSendReady = () => createSelector(selectWallet, (state) => state.is_send_ready);

export const selectSelectedAssetId = () => createSelector(selectWallet, (state) => state.selected_asset_id);
