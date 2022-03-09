import { styled } from '@linaria/react';
import { PALLETE_ASSETS } from '@app/shared/constants';
import { AssetIconProps } from '@app/shared/components/AssetIcon';

export const DetailTabs = styled.div`
  display: flex;
  margin: 0 -30px;
  .transaction-item {
    padding: 10px 30px;
    font-size: 14px;
    font-weight: 500;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: 3px;
    text-align: center;
    color: #fff;
    text-transform: uppercase;
    opacity: 0.5;
    cursor: pointer;
    &.active {
      opacity: 1;
      border-bottom: 3px solid #00f6d2;
    }
  }
`;

export const DetailInfoWrapper = styled.div`
  padding: 30px 0;
`;

export const InformationItem = styled.div<AssetIconProps>`
  margin-bottom: 30px;
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
  }
  .value {
    display: flex;
    margin: 10px 0 0;
    font-size: 14px;
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: normal;
    color: #fff;
    align-items: center;
    word-break: break-word;

    .asset-label {
      align-items: center;
      .iconClass {
        position: relative;
      }
      .asset-name {
        color: ${({ asset_id }) => (PALLETE_ASSETS[asset_id] ? PALLETE_ASSETS[asset_id] : PALLETE_ASSETS[asset_id % PALLETE_ASSETS.length])};
      }
      &.income {
        .asset-name {
          color: #0bccf7;
        }
      }
      &.outcome {
        .asset-name {
          color: #c061e0;
        }
      }
    }

    &.asset {
      display: block;
      .amount-comment {
        font-size: 12px;
        font-weight: normal;
        font-stretch: normal;
        font-style: normal;
        line-height: normal;
        letter-spacing: normal;
        color: #fff;
        opacity: 0.5;
        margin-left: 36px;
      }
      &.mlt-asset {
        display: flex;
        margin-top: -5px;
        .multi-asset {
          margin-left: 0;
        }

        .multi-asset-title {
          padding-top: 20px;
          font-weight: 600;
          font-size: 16px;

          &::after {
            content: '';
            padding: 0;
          }
        }
      }
    }

    > p {
      width: 90%;
      margin: 0;
      display: inline-block;
    }

    > span {
      &::after {
        content: '|';
        padding: 0 12px;
      }

      &:last-child {
        &::after {
          display: none;
        }
      }
    }
  }
`;
