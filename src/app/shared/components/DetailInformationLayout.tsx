import { styled } from '@linaria/react';
import { PALLETE_ASSETS } from '@app/shared/constants';
import { AssetIconProps } from '@app/shared/components/AssetIcon';

export const DetailTabs = styled.div`
  display: flex;
  margin: 0 0 24px;
  border-bottom: 1px solid var(--cp-line);
  .transaction-item {
    padding: 10px 14px;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-align: center;
    color: var(--cp-muted);
    text-transform: uppercase;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    &.active {
      color: var(--cp-text);
      border-bottom-color: var(--cp-accent);
      text-shadow: 0 0 10px rgba(0, 246, 210, 0.4);
    }
  }
`;

export const DetailInfoWrapper = styled.div`
  padding: 0;
`;

export const InformationItem = styled.div<AssetIconProps>`
  margin-bottom: 22px;
  .title {
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.14em;
    color: var(--cp-muted);
    text-transform: uppercase;
  }
  .value {
    display: flex;
    margin: 9px 0 0;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: normal;
    line-height: 1.5;
    color: var(--cp-text);
    align-items: center;
    word-break: break-word;

    .confidential-id {
      display: flex;
      align-items: center;
      margin-top: 10px;
      .confidential-id-label {
        font-weight: normal;
        font-stretch: normal;
        font-style: normal;
        line-height: normal;
        letter-spacing: normal;
        color: #fff;
        opacity: 0.5;
        margin-right: 10px;
      }
      .confidential-id-value {
        display: flex;
        align-items: center;
      }
    }

    .asset-label {
      align-items: center;

      &.fee {
        .asset-name {
          color: white;
        }
      }
      .iconClass {
        position: relative;
      }
      .asset-name {
        color: ${({ asset_id }) => (PALLETE_ASSETS[asset_id] ? PALLETE_ASSETS[asset_id] : PALLETE_ASSETS[asset_id % PALLETE_ASSETS.length])};
      }
      &.income {
        .asset-name {
          color: var(--cp-accent-3);
        }
      }
      &.outcome {
        .asset-name {
          color: var(--cp-accent-2);
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
