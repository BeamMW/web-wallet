import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { toast } from 'react-toastify';
import ethereum_address from 'ethereum-address';
import { ethers } from 'ethers';
import { useSelector } from 'react-redux';
import { Window } from '@app/shared/components';
import { selectAssets } from '@app/containers/Wallet/store/selectors';
import { convertLowAmount, fromGroths } from '@core/utils';
import {
  formatEthereumAddress,
  isMetaMaskInstalled,
  requestAccountChange,
  switchToNetwork,
  getEthersProvider,
} from '../../utils/ethereumWallet';
import { sendTo } from '../../utils/beamWalletApi';
import { useRelayerFee } from '../../utils/useRelayerFee';
import { useBeamAddress } from '../../utils/useBeamAddress';
import { useMetaMaskAccount } from '../../utils/useMetaMaskAccount';
import { useEvmBalances } from '../../utils/useEvmBalances';
import {
  BEAM_ADDRESS_LENGTH, BEAM_BRIDGE_ASSETS, NETWORKS_BY_ID, getEvmAssets,
} from '../../constants';
import { NetworkOption } from './components/NetworkSelector';
import { ethPipeAbi, ethErc20PipeAbi, erc20Abi } from '../../utils/evmContracts';
import { SwapForm } from './components/SwapForm';
import { SwapModeTabs, SwapMode } from './components/SwapModeTabs';
import { DexSwapContainer } from '../DexSwapContainer/DexSwapContainer';

const amountPattern = /^\d*\.?\d*$/;

const NETWORK_OPTIONS: NetworkOption[] = Object.entries(NETWORKS_BY_ID).map(([id, info]) => ({
  id,
  label: info.name,
}));

const TRANSACTION_FEE = 0.011;
const DEFAULT_BEAM_RELAYER_FEE = 0.01;
const DEFAULT_EVM_RELAYER_FEE = 0.02;

const normalizeAmount = (value: string) => (value === '' || amountPattern.test(value) ? value : null);

const formatTokenAmount = (value: string | undefined, decimals: number) => {
  if (!value) {
    return '—';
  }
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return value;
  }
  const precision = Math.min(8, Math.max(decimals, 0));
  return num.toFixed(precision).replace(/\.?0+$/, '');
};

const formatBeamAmount = (value: number) => {
  if (!Number.isFinite(value)) {
    return '—';
  }
  const converted = convertLowAmount(value);
  return `${converted}`;
};

const parseUnitsSafe = (value: string, decimals: number) => {
  try {
    return ethers.utils.parseUnits(value, decimals);
  } catch {
    return null;
  }
};

export const SwapContainer = () => {
  const assets = useSelector(selectAssets());
  const [swapMode, setSwapMode] = useState<SwapMode>('cross-chain');
  const [isLoadingEth, setIsLoadingEth] = useState(false);
  const [isSendingBeam, setIsSendingBeam] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('42161');
  const [swapDirection, setSwapDirection] = useState<'beam-to-evm' | 'evm-to-beam'>('beam-to-evm');

  const [beamToEvmAmount, setBeamToEvmAmount] = useState('');
  const [selectedBeamAssetId, setSelectedBeamAssetId] = useState(BEAM_BRIDGE_ASSETS[0]?.assetId ?? 0);

  const [evmToBeamAmount, setEvmToBeamAmount] = useState('');
  const [selectedEvmAssetName, setSelectedEvmAssetName] = useState('');
  const [evmSubmitState, setEvmSubmitState] = useState<'idle' | 'approving' | 'sending'>('idle');
  const [evmSubmitError, setEvmSubmitError] = useState<string | null>(null);

  const {
    wallet: ethWallet,
    address: ethAddress,
    connect: connectMetaMaskWallet,
    refresh: refreshMetaMask,
    clear: clearMetaMask,
  } = useMetaMaskAccount();
  const handleBeamAddressError = useCallback(() => {
    toast.error('Failed to load Beam wallet address from contract. Make sure pipe_app.wasm is available.');
  }, []);
  const { address: beamAddress } = useBeamAddress(selectedNetwork, handleBeamAddressError);

  const networkInfo = NETWORKS_BY_ID[Number(selectedNetwork)];
  const networkName = networkInfo?.name ?? 'Network';
  const relayerFeeNetworkId = networkInfo?.relayerFeeNetworkId ?? 'arbitrum';
  const isBeamToEvm = swapDirection === 'beam-to-evm';

  const selectedBeamAsset = useMemo(
    () => BEAM_BRIDGE_ASSETS.find((asset) => asset.assetId === selectedBeamAssetId) ?? BEAM_BRIDGE_ASSETS[0],
    [selectedBeamAssetId],
  );
  const selectedBeamAssetTotal = useMemo(
    () => assets.find((asset) => asset.asset_id === selectedBeamAsset?.assetId),
    [assets, selectedBeamAsset],
  );
  const beamAssetBalance = selectedBeamAssetTotal ? fromGroths(selectedBeamAssetTotal.available) : 0;

  const evmAssets = useMemo(() => getEvmAssets(Number(selectedNetwork)), [selectedNetwork]);
  const {
    balances: evmBalances,
    isLoading: isLoadingEvmBalances,
    refresh: refreshEvmBalances,
  } = useEvmBalances({
    wallet: ethWallet,
    selectedNetwork,
    assets: evmAssets,
  });
  const selectedEvmAsset = useMemo(
    () => evmAssets.find((asset) => asset.name === selectedEvmAssetName) ?? evmAssets[0],
    [evmAssets, selectedEvmAssetName],
  );
  const selectedEvmBalance = selectedEvmAsset ? evmBalances[selectedEvmAsset.name] : undefined;

  useEffect(() => {
    if (!evmAssets.length) {
      setSelectedEvmAssetName('');
      return;
    }
    setSelectedEvmAssetName((current) => (evmAssets.some((asset) => asset.name === current) ? current : evmAssets[0].name));
  }, [evmAssets]);

  const {
    relayerFeeByNetwork,
    isLoading: isLoadingFee,
    error: feeError,
  } = useRelayerFee(
    selectedNetwork,
    relayerFeeNetworkId,
    selectedBeamAsset?.rateId ?? 'beam',
    selectedBeamAsset?.decimals ?? 8,
  );
  const beamRelayerFee = relayerFeeByNetwork ?? DEFAULT_BEAM_RELAYER_FEE;

  const { relayerFeeByNetwork: evmRelayerFeeByNetwork } = useRelayerFee(
    selectedNetwork,
    relayerFeeNetworkId,
    selectedEvmAsset?.rateId ?? 'ethereum',
    selectedEvmAsset?.decimals ?? 18,
  );
  const evmRelayerFee = evmRelayerFeeByNetwork ?? DEFAULT_EVM_RELAYER_FEE;

  useEffect(() => {
    if (ethWallet?.chainId && String(ethWallet.chainId) !== selectedNetwork) {
      setSelectedNetwork(String(ethWallet.chainId));
    }
  }, [ethWallet?.chainId, selectedNetwork]);

  const handleConnectMetaMask = async () => {
    setIsLoadingEth(true);
    try {
      if (!isMetaMaskInstalled()) {
        toast.error('MetaMask is not installed. Please install MetaMask to continue.');
        return;
      }

      const wallet = await connectMetaMaskWallet(Number(selectedNetwork));
      if (wallet) {
        toast.success('Connected to MetaMask');
      }
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Failed to connect MetaMask:', error);
      toast.error(error?.message || 'Failed to connect to MetaMask');
    } finally {
      setIsLoadingEth(false);
    }
  };

  const handleSwitchNetwork = async () => {
    setIsLoadingEth(true);
    try {
      if (!isMetaMaskInstalled()) {
        toast.error('MetaMask is not installed. Please install MetaMask to continue.');
        return;
      }

      await switchToNetwork(Number(selectedNetwork));
      toast.success(`Switched to ${networkName} network`);
      await refreshMetaMask();
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Failed to switch network:', error);
      toast.error(error?.message || `Failed to switch to ${networkName} network`);
    } finally {
      setIsLoadingEth(false);
    }
  };

  const handleNetworkSelect = async (networkId: string) => {
    setSelectedNetwork(networkId);
    if (ethWallet) {
      setIsLoadingEth(true);
      try {
        await switchToNetwork(Number(networkId));
        await refreshMetaMask();
      } catch (error: any) {
        // eslint-disable-next-line no-console
        console.error('Failed to switch network:', error);
        toast.error(error?.message || `Failed to switch to ${NETWORKS_BY_ID[Number(networkId)]?.name ?? 'network'}`);
      } finally {
        setIsLoadingEth(false);
      }
    }
  };

  const handleChangeAccount = async () => {
    setIsLoadingEth(true);
    try {
      if (!isMetaMaskInstalled()) {
        toast.error('MetaMask is not installed. Please install MetaMask to continue.');
        return;
      }
      const result = await requestAccountChange();
      if (result) {
        await refreshMetaMask();
        toast.success('Account updated');
      }
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Failed to change MetaMask account:', error);
      toast.error(error?.message || 'Failed to change account');
    } finally {
      setIsLoadingEth(false);
    }
  };

  const handleDisconnect = () => {
    clearMetaMask();
  };

  useEffect(() => {
    setEvmSubmitError(null);
  }, [evmToBeamAmount, beamAddress, selectedEvmAssetName, swapDirection]);

  const handleBeamAmountChange = (value: string) => {
    const next = normalizeAmount(value);
    if (next !== null) {
      setBeamToEvmAmount(next);
    }
  };

  const handleEvmAmountChange = (value: string) => {
    const next = normalizeAmount(value);
    if (next !== null) {
      setEvmToBeamAmount(next);
    }
  };

  const handleDirectionToggle = () => {
    setSwapDirection((prev) => (prev === 'beam-to-evm' ? 'evm-to-beam' : 'beam-to-evm'));
  };

  const handleActiveAmountChange = (value: string) => {
    if (isBeamToEvm) {
      handleBeamAmountChange(value);
    } else {
      handleEvmAmountChange(value);
    }
  };

  const handleAssetSelect = (value: number | string) => {
    if (isBeamToEvm) {
      setSelectedBeamAssetId(Number(value));
    } else {
      setSelectedEvmAssetName(String(value));
    }
  };

  const beamRecipientError = useMemo(() => {
    if (!ethAddress) {
      return 'Connect MetaMask to use your EVM address';
    }
    const cleanAddress = formatEthereumAddress(ethAddress.trim());
    if (!ethereum_address.isAddress(cleanAddress)) {
      return 'Invalid Ethereum address';
    }
    return undefined;
  }, [ethAddress]);

  const beamAmountError = useMemo(() => {
    if (!beamToEvmAmount) return undefined;
    const amount = Number(beamToEvmAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return 'Enter a valid amount';
    }
    if (!selectedBeamAsset) {
      return 'Select an asset';
    }
    if (amount + beamRelayerFee + TRANSACTION_FEE > beamAssetBalance) {
      return `Insufficient ${selectedBeamAsset.name} balance`;
    }
    return undefined;
  }, [beamToEvmAmount, beamRelayerFee, beamAssetBalance, selectedBeamAsset]);

  const beamAssetCid = selectedBeamAsset?.cidByNetwork?.[selectedNetwork];

  const beamReceiverError = useMemo(() => {
    if (!beamAddress) {
      return 'Beam address is not available';
    }
    if (beamAddress.length !== BEAM_ADDRESS_LENGTH) {
      return 'Beam address must be 66 hex chars';
    }
    if (!/^[0-9a-fA-F]+$/.test(beamAddress)) {
      return 'Beam address is invalid';
    }
    return undefined;
  }, [beamAddress]);

  const evmAmountError = useMemo(() => {
    if (!evmToBeamAmount) return undefined;
    if (!selectedEvmAsset) return 'Select an asset';
    const amount = parseUnitsSafe(evmToBeamAmount, selectedEvmAsset.decimals);
    if (!amount || amount.lte(0)) {
      return 'Enter a valid amount';
    }
    const fee = parseUnitsSafe(String(evmRelayerFee), selectedEvmAsset.decimals);
    if (!fee) {
      return 'Failed to calculate relayer fee';
    }
    if (selectedEvmBalance && amount.add(fee).gt(selectedEvmBalance.raw)) {
      return `Insufficient ${selectedEvmAsset.name} balance`;
    }
    return undefined;
  }, [evmToBeamAmount, selectedEvmAsset, selectedEvmBalance, evmRelayerFee]);

  const isNetworkMismatch = ethWallet?.chainId && ethWallet.chainId !== Number(selectedNetwork);

  const beamTotalDeducted = useMemo(() => {
    const amount = Number(beamToEvmAmount);
    if (!Number.isFinite(amount) || amount <= 0) return null;
    return amount + beamRelayerFee + TRANSACTION_FEE;
  }, [beamToEvmAmount, beamRelayerFee]);

  const evmTotalDeducted = useMemo(() => {
    if (!evmToBeamAmount || !selectedEvmAsset) return null;
    const amount = parseUnitsSafe(evmToBeamAmount, selectedEvmAsset.decimals);
    const fee = parseUnitsSafe(String(evmRelayerFee), selectedEvmAsset.decimals);
    if (!amount || !fee || amount.lte(0)) return null;
    return ethers.utils.formatUnits(amount.add(fee), selectedEvmAsset.decimals);
  }, [evmToBeamAmount, selectedEvmAsset, evmRelayerFee]);

  const activeTotalDeducted = useMemo(() => {
    if (isBeamToEvm) {
      if (beamTotalDeducted == null) return null;
      return `${formatBeamAmount(beamTotalDeducted)} ${selectedBeamAsset?.name ?? 'BEAM'}`;
    }
    if (evmTotalDeducted == null) return null;
    return `${formatTokenAmount(evmTotalDeducted, selectedEvmAsset?.decimals ?? 8)} ${selectedEvmAsset?.name ?? ''}`;
  }, [isBeamToEvm, beamTotalDeducted, evmTotalDeducted, selectedBeamAsset, selectedEvmAsset]);

  const canSendBeam = Boolean(beamToEvmAmount && ethAddress && !beamRecipientError && !beamAmountError && beamAssetCid) && !isLoadingFee;

  const canSendEvm = Boolean(
    evmToBeamAmount
      && beamAddress
      && !beamReceiverError
      && !evmAmountError
      && selectedEvmAsset
      && ethWallet
      && !isNetworkMismatch,
  );

  const activeAmount = isBeamToEvm ? beamToEvmAmount : evmToBeamAmount;
  const activeAmountError = isBeamToEvm ? beamAmountError : evmAmountError;
  const activeBalanceDisplay = isBeamToEvm
    ? `${formatBeamAmount(beamAssetBalance)} ${selectedBeamAsset?.name ?? ''}`
    : `${formatTokenAmount(selectedEvmBalance?.formatted, selectedEvmAsset?.decimals ?? 8)} ${
      selectedEvmAsset?.name ?? ''
    }`;
  const activeToTokenLabel = isBeamToEvm
    ? selectedBeamAsset?.evmSymbol ?? '—'
    : selectedEvmAsset?.beamAssetName ?? 'BEAM';
  const activeSelectValue = isBeamToEvm ? selectedBeamAsset?.assetId ?? 0 : selectedEvmAsset?.name ?? '';
  const activeCanSend = isBeamToEvm ? canSendBeam : canSendEvm;
  const activeIsSubmitting = isBeamToEvm ? isSendingBeam : evmSubmitState !== 'idle';
  const activeButtonLabel = (() => {
    if (isBeamToEvm) {
      return isSendingBeam ? 'Sending...' : 'Send';
    }
    if (evmSubmitState === 'approving') {
      return 'Approving...';
    }
    if (evmSubmitState === 'sending') {
      return 'Sending...';
    }
    return 'Send';
  })();
  const activeAssetOptions = isBeamToEvm
    ? BEAM_BRIDGE_ASSETS.map((asset) => ({ value: asset.assetId, label: asset.name }))
    : evmAssets.map((asset) => ({ value: asset.name, label: asset.name }));

  const beamMaxDisabled = beamAssetBalance <= beamRelayerFee + TRANSACTION_FEE;
  const evmMaxDisabled = !selectedEvmBalance;

  const notices = useMemo(() => {
    const items: Array<{ message: string; tone?: 'error' | 'muted' }> = [];
    if (isBeamToEvm && beamRecipientError) {
      items.push({ tone: 'error', message: beamRecipientError });
    }
    if (!isBeamToEvm && beamReceiverError) {
      items.push({ tone: 'error', message: beamReceiverError });
    }
    if (isBeamToEvm && !beamAssetCid) {
      items.push({
        tone: 'error',
        message: `${selectedBeamAsset?.name} is not available on ${networkName}.`,
      });
    }
    if (!isBeamToEvm && isNetworkMismatch) {
      items.push({
        tone: 'error',
        message: `MetaMask network does not match ${networkName}. Switch to continue.`,
      });
    }
    return items;
  }, [
    beamAssetCid,
    beamReceiverError,
    beamRecipientError,
    isBeamToEvm,
    isNetworkMismatch,
    networkName,
    selectedBeamAsset?.name,
  ]);

  const handleBeamMax = () => {
    if (!selectedBeamAsset) return;
    const maxValue = Math.max(beamAssetBalance - beamRelayerFee - TRANSACTION_FEE, 0);
    setBeamToEvmAmount(formatBeamAmount(maxValue));
  };

  const handleEvmMax = () => {
    if (!selectedEvmAsset || !selectedEvmBalance) return;
    const fee = parseUnitsSafe(String(evmRelayerFee), selectedEvmAsset.decimals);
    if (!fee) return;
    const maxValue = selectedEvmBalance.raw.gt(fee) ? selectedEvmBalance.raw.sub(fee) : ethers.BigNumber.from(0);
    setEvmToBeamAmount(ethers.utils.formatUnits(maxValue, selectedEvmAsset.decimals));
  };

  const handleActiveMax = () => {
    if (isBeamToEvm) {
      handleBeamMax();
    } else {
      handleEvmMax();
    }
  };

  const handleBeamSend = async () => {
    if (!selectedBeamAsset || !beamAssetCid) {
      toast.error(`Selected token is not available on ${networkName}`);
      return;
    }
    const amount = Number(beamToEvmAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    const cleanAddress = formatEthereumAddress(ethAddress.trim());
    if (!ethereum_address.isAddress(cleanAddress)) {
      toast.error('Invalid Ethereum address');
      return;
    }

    setIsSendingBeam(true);
    try {
      await sendTo({
        // Send the typed string, not `amount` — converting via a double first would
        // round high-decimal tokens before the base-unit conversion ever runs.
        amount: beamToEvmAmount.trim(),
        address: cleanAddress.replace(/^0x/i, ''),
        fee: beamRelayerFee,
        decimals: selectedBeamAsset.decimals,
        cid: beamAssetCid,
      });
      toast.success('Transaction sent successfully!');
      setBeamToEvmAmount('');
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Failed to send transaction:', error);
      toast.error(error?.message || 'Failed to send transaction');
    } finally {
      setIsSendingBeam(false);
    }
  };

  const handleEvmSend = async () => {
    if (!selectedEvmAsset || !ethWallet || !beamAddress || beamReceiverError) {
      return;
    }
    const provider = getEthersProvider();
    if (!provider) {
      toast.error('MetaMask provider not available');
      return;
    }

    const amount = parseUnitsSafe(evmToBeamAmount, selectedEvmAsset.decimals);
    const fee = parseUnitsSafe(String(evmRelayerFee), selectedEvmAsset.decimals);
    if (!amount || !fee) {
      toast.error('Invalid amount');
      return;
    }

    const receiverBeam = beamAddress.startsWith('0x') ? beamAddress : (`0x${beamAddress}` as `0x${string}`);

    setEvmSubmitError(null);
    try {
      const signer = provider.getSigner();
      const required = amount.add(fee);

      if (selectedEvmAsset.kind === 'erc20') {
        if (!selectedEvmAsset.ethTokenContract) {
          throw new Error('Missing token contract');
        }
        const tokenContract = new ethers.Contract(selectedEvmAsset.ethTokenContract, erc20Abi, signer);
        const allowance: ethers.BigNumber = await tokenContract.allowance(
          ethWallet.address,
          selectedEvmAsset.ethPipeContract,
        );
        if (allowance.lt(required)) {
          setEvmSubmitState('approving');
          toast.info('Approval required. Confirm in your wallet…');
          const approveTx = await tokenContract.approve(selectedEvmAsset.ethPipeContract, required);
          await approveTx.wait();
          toast.success('Approval confirmed');
        }
      }

      setEvmSubmitState('sending');
      toast.info('Sending transfer…');
      const pipeContract = new ethers.Contract(
        selectedEvmAsset.ethPipeContract,
        selectedEvmAsset.kind === 'native' ? ethPipeAbi : ethErc20PipeAbi,
        signer,
      );

      const tx = selectedEvmAsset.kind === 'native'
        ? await pipeContract.sendFunds(amount, fee, receiverBeam, { value: required })
        : await pipeContract.sendFunds(amount, fee, receiverBeam);
      await tx.wait();
      toast.success('Transfer confirmed');
      setEvmToBeamAmount('');
      refreshEvmBalances();
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Transfer failed:', error);
      const msg = error instanceof Error ? error.message : 'Transaction failed';
      setEvmSubmitError(msg);
      toast.error(msg);
    } finally {
      setEvmSubmitState('idle');
    }
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isBeamToEvm) {
      handleBeamSend();
    } else {
      handleEvmSend();
    }
  };

  return (
    <Window title="Swap">
      <SwapModeTabs mode={swapMode} onChange={setSwapMode} />
      {swapMode === 'dex' ? (
        <DexSwapContainer />
      ) : (
        <SwapForm
          fromChain={isBeamToEvm ? 'Beam' : networkName}
          toChain={isBeamToEvm ? networkName : 'Beam'}
          fromColor={isBeamToEvm ? 'purple' : 'blue'}
          toColor={isBeamToEvm ? 'blue' : 'purple'}
          onToggleDirection={handleDirectionToggle}
          networkSelector={{
            networks: NETWORK_OPTIONS,
            selected: selectedNetwork,
            connectedChainId: ethWallet?.chainId ?? null,
            onSelect: handleNetworkSelect,
            disabled: isLoadingEth,
          }}
          walletInfo={
            ethWallet
              ? {
                address: ethAddress,
                networkMismatch: Boolean(isNetworkMismatch),
                onChangeAccount: handleChangeAccount,
                onDisconnect: handleDisconnect,
                isLoading: isLoadingEth,
              }
              : undefined
          }
          notices={notices}
          evmSubmitError={!isBeamToEvm ? evmSubmitError : null}
          amount={{
            value: activeAmount,
            error: activeAmountError,
            palette: isBeamToEvm ? 'purple' : 'blue',
            onChange: handleActiveAmountChange,
            selectValue: activeSelectValue,
            selectOptions: activeAssetOptions,
            onSelect: handleAssetSelect,
            availableLabel: activeBalanceDisplay,
            onMax: handleActiveMax,
            isMaxDisabled: isBeamToEvm ? beamMaxDisabled : evmMaxDisabled,
            isLoadingBalances: !isBeamToEvm && isLoadingEvmBalances,
          }}
          output={{
            value: activeAmount,
            tokenLabel: activeToTokenLabel,
          }}
          fees={{
            isBeamToEvm,
            relayerFee: isBeamToEvm ? beamRelayerFee : evmRelayerFee,
            relayerFeeLabel: isBeamToEvm ? selectedBeamAsset?.name ?? 'BEAM' : selectedEvmAsset?.name ?? 'ASSET',
            relayerFeeDecimals: isBeamToEvm ? 8 : 4,
            transactionFee: isBeamToEvm ? TRANSACTION_FEE : undefined,
            feeFallback: Boolean(feeError),
            totalDeducted: activeTotalDeducted,
          }}
          actions={{
            showConnect: !ethWallet,
            connectLabel: isLoadingEth ? 'Connecting...' : 'Connect MetaMask',
            onConnect: handleConnectMetaMask,
            showSwitch: Boolean(isNetworkMismatch) && !isBeamToEvm,
            switchLabel: isLoadingEth ? 'Switching...' : `Switch to ${networkName}`,
            onSwitch: handleSwitchNetwork,
            isLoadingEth,
            submitLabel: activeButtonLabel,
            canSubmit: activeCanSend,
            isSubmitting: activeIsSubmitting,
            submitPalette: isBeamToEvm ? 'purple' : 'blue',
          }}
          onSubmit={handleFormSubmit}
        />
      )}
    </Window>
  );
};
