import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { toast } from 'react-toastify';
import { toGroths, fromGroths } from '@core/utils';
import { executeDexTrade, predictDexTrade } from '../../utils/dexApi';
import { useDexPools } from '../../utils/useDexPools';
import { useDexPrediction } from '../../utils/useDexPrediction';
import { DEX_TX_FEE, DEFAULT_SLIPPAGE_PERCENT } from '../../utils/dexConstants';
import { DexSwapForm } from '../SwapContainer/components/DexSwapForm';

const AMOUNT_PATTERN = /^\d*\.?\d*$/;

function normalizeAmount(value: string): string | null {
  return value === '' || AMOUNT_PATTERN.test(value) ? value : null;
}

function grothsToDisplay(groths: number): string {
  if (!groths) return '';
  const v = fromGroths(groths);
  return v.toFixed(8).replace(/\.?0+$/, '');
}

export const DexSwapContainer = () => {
  const {
    assets,
    isLoading: isLoadingPools,
    error: poolsError,
    getTargetAssets,
    getPoolsForPair,
    reload,
  } = useDexPools(true);

  const [fromAid, setFromAid] = useState<number | null>(0);
  const [toAid, setToAid] = useState<number | null>(7);
  const [fromAmount, setFromAmount] = useState('');
  const [manualKind, setManualKind] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slippagePercent, setSlippagePercent] = useState(DEFAULT_SLIPPAGE_PERCENT);

  const effectiveFromAid = fromAid;

  const fromAsset = useMemo(() => assets.find((a) => a.aid === effectiveFromAid) ?? null, [assets, effectiveFromAid]);

  const toAssets = useMemo(
    () => (effectiveFromAid !== null ? getTargetAssets(effectiveFromAid) : []),
    [effectiveFromAid, getTargetAssets],
  );

  const toAsset = useMemo(() => (toAid !== null ? assets.find((a) => a.aid === toAid) ?? null : null), [assets, toAid]);

  const pairPools = useMemo(
    () => (effectiveFromAid !== null && toAid !== null ? getPoolsForPair(effectiveFromAid, toAid) : []),
    [effectiveFromAid, toAid, getPoolsForPair],
  );

  const availableKinds = useMemo(() => pairPools.map((p) => p.kind).sort(), [pairPools]);

  // Reset manual kind when pair changes
  useEffect(() => {
    setManualKind(null);
  }, [effectiveFromAid, toAid]);

  const fromGrothsValue = useMemo(() => {
    const n = parseFloat(fromAmount);
    return Number.isFinite(n) && n > 0 ? toGroths(n) : 0;
  }, [fromAmount]);

  const {
    predicted,
    isLoading: isPredicting,
    bestPool,
  } = useDexPrediction(effectiveFromAid, toAid, pairPools, fromGrothsValue, manualKind);

  // The active pool for display: best from prediction (auto) or manually chosen
  const selectedPool = manualKind !== null ? pairPools.find((p) => p.kind === manualKind) ?? bestPool : bestPool;

  const selectedKind = selectedPool?.kind ?? availableKinds[0] ?? 1;

  const predictedOutput = useMemo(() => (predicted?.buy ? grothsToDisplay(predicted.buy) : null), [predicted]);

  // Floor on what the swap may return. The quote above is a prediction against the
  // pool's current reserves; by the time the trade lands the price can have moved,
  // so anything below this is treated as "the quote went stale" and not submitted.
  const minReceiveGroths = useMemo(
    () => (predicted?.buy ? Math.floor(predicted.buy * (1 - slippagePercent / 100)) : 0),
    [predicted, slippagePercent],
  );

  const minReceiveDisplay = useMemo(
    () => (minReceiveGroths > 0 ? grothsToDisplay(minReceiveGroths) : null),
    [minReceiveGroths],
  );

  const fromAmountError = useMemo(() => {
    if (!fromAmount || !fromAsset) return undefined;
    if (fromGrothsValue <= 0) return 'Enter a valid amount';
    const txFeeGroths = toGroths(DEX_TX_FEE);
    const required = effectiveFromAid === 0 ? fromGrothsValue + txFeeGroths : fromGrothsValue;
    if (required > fromAsset.available) {
      return `Insufficient ${fromAsset.name} balance`;
    }
    return undefined;
  }, [fromAmount, fromAsset, fromGrothsValue, effectiveFromAid]);

  const canSwap = Boolean(
    effectiveFromAid !== null
      && toAid !== null
      && selectedPool
      && fromAmount
      && !fromAmountError
      && !isPredicting
      && (predicted?.buy ?? 0) > 0,
  );

  const handleFromAssetChange = useCallback((aid: number) => {
    setFromAid(aid);
    setToAid(null);
    setManualKind(null);
    setFromAmount('');
  }, []);

  const handleToAssetChange = useCallback((aid: number) => {
    setToAid(aid);
    setManualKind(null);
    setFromAmount('');
  }, []);

  const handleDirectionToggle = useCallback(() => {
    if (toAid === null) return;
    const prevFrom = effectiveFromAid;
    const prevTo = toAid;
    setFromAid(prevTo);
    setToAid(prevFrom);
    setFromAmount('');
  }, [effectiveFromAid, toAid]);

  const handleAmountChange = useCallback((value: string) => {
    const next = normalizeAmount(value);
    if (next !== null) setFromAmount(next);
  }, []);

  const handleMax = useCallback(() => {
    if (!fromAsset) return;
    let maxGrothsValue = fromAsset.available;
    if (effectiveFromAid === 0) {
      maxGrothsValue = Math.max(maxGrothsValue - toGroths(DEX_TX_FEE), 0);
    }
    setFromAmount(grothsToDisplay(maxGrothsValue));
  }, [fromAsset, effectiveFromAid]);

  const handleKindChange = useCallback((kind: number) => {
    setManualKind(kind);
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!canSwap || !selectedPool || effectiveFromAid === null || toAid === null) return;

      setIsSubmitting(true);
      try {
        const tradeParams = {
          aid1: toAid, // asset you receive
          aid2: effectiveFromAid, // asset you pay
          kind: selectedPool.kind,
          val1_buy: 0,
          val2_pay: fromGrothsValue,
        };

        // The displayed quote is debounced and can be seconds old. Re-price against
        // the live pool right before signing and bail if the output has dropped
        // below the slippage floor, rather than accepting whatever the pool gives.
        const fresh = await predictDexTrade(tradeParams);
        const freshBuy = fresh?.buy ?? 0;

        if (freshBuy < minReceiveGroths) {
          toast.error(
            `Price moved: you would receive ${grothsToDisplay(freshBuy) || '0'} ${toAsset?.name ?? ''}, `
              + `below your ${slippagePercent}% slippage limit of ${grothsToDisplay(minReceiveGroths)}. `
              + 'Swap cancelled — retry or raise the tolerance.',
          );
          return;
        }

        await executeDexTrade(tradeParams);
        toast.success('Swap submitted!');
        setFromAmount('');
        reload();
      } catch (e: any) {
        const msg: string = e?.message ?? 'Swap failed';
        if (!msg.toLowerCase().includes('cancel')) {
          toast.error(msg);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      canSwap,
      selectedPool,
      effectiveFromAid,
      toAid,
      toAsset,
      fromGrothsValue,
      minReceiveGroths,
      slippagePercent,
      reload,
    ],
  );

  const fromBalanceDisplay = fromAsset ? `${grothsToDisplay(fromAsset.available) || '0'} ${fromAsset.name}` : '—';

  const fromOptions = assets.map((a) => ({ value: a.aid, label: a.name }));
  const toOptions = toAssets.map((a) => ({ value: a.aid, label: a.name }));

  useEffect(() => {
    if (poolsError) {
      toast.error(`DEX: ${poolsError}`);
    }
  }, [poolsError]);

  return (
    <DexSwapForm
      isLoadingPools={isLoadingPools}
      fromAsset={{
        aid: effectiveFromAid ?? -1,
        name: fromAsset?.name ?? '…',
        options: fromOptions,
      }}
      toAsset={{
        aid: toAid ?? -1,
        name: toAsset?.name ?? '—',
        options: toOptions,
      }}
      fromAmount={fromAmount}
      fromAmountError={fromAmountError}
      fromBalanceDisplay={fromBalanceDisplay}
      isMaxDisabled={!fromAsset || fromAsset.available === 0}
      predictedOutput={predictedOutput}
      isPredicting={isPredicting}
      minReceiveDisplay={minReceiveDisplay}
      slippagePercent={slippagePercent}
      onSlippageChange={setSlippagePercent}
      availableKinds={availableKinds}
      selectedKind={selectedKind}
      selectedPool={selectedPool}
      txFee={DEX_TX_FEE}
      onFromAssetChange={handleFromAssetChange}
      onToAssetChange={handleToAssetChange}
      onAmountChange={handleAmountChange}
      onMax={handleMax}
      onDirectionToggle={handleDirectionToggle}
      onKindChange={handleKindChange}
      onSubmit={handleSubmit}
      canSwap={canSwap}
      isSubmitting={isSubmitting}
    />
  );
};
