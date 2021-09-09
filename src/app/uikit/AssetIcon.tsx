import React from 'react';

import { WalletTotal } from '@core/types';

import BeamIconSvg from '@icons/icon-beam.svg';
import AssetIconSvg from '@icons/icon-asset.svg';

interface AssetIconProps extends Partial<WalletTotal> {
  asset_id?: number;
  className?: string;
}

const AssetIcon: React.FC<AssetIconProps> = ({
  asset_id = 0,
  className,
}) => {
  const IconComponent = asset_id === 0 ? BeamIconSvg : AssetIconSvg;
  return <IconComponent className={className} />;
};

export default AssetIcon;
