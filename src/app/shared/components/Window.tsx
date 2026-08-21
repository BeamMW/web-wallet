import React, { useEffect, useRef, useState } from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';
import {
  IconEye, IconLockWallet, MenuIcon, IconEyeCrossed, InfoButton, AngleBackIcon,
} from '@app/shared/icons';

import { useNavigate } from 'react-router-dom';

import useOutsideClick from '@app/shared/hooks/OutsideClickHook';
import { useDispatch, useSelector } from 'react-redux';
import { actions } from '@app/shared/store';
import { selectIsBalanceHidden } from '@app/shared/store/selectors';
import Logo from './Logo';
import Button from './Button';
import Menu from './Menu';

interface WindowProps {
  title?: string;
  primary?: boolean;
  pallete?: 'default' | 'blue' | 'purple';
  onPrevious?: React.MouseEventHandler | undefined;
  navigateToInfo?: React.MouseEventHandler | undefined;
  showHideButton?: boolean;
  showInfoButton?: boolean;
  children?: React.ReactNode;
}

function accentColor(pallete: string): string {
  switch (pallete) {
    case 'blue':
      return 'var(--cp-accent-3)';
    case 'purple':
      return 'var(--cp-accent-2)';
    default:
      return 'var(--cp-accent)';
  }
}

const HEADER_H = 56;

const ContainerStyled = styled.div<{ pallete: string }>`
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  text-align: left;
`;

// ── HUD header ──────────────────────────────────────────────────────────────
const HeaderStyled = styled.header<{ pallete: string }>`
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  height: ${HEADER_H}px;
  padding: 0 14px;
  background: linear-gradient(180deg, rgba(0, 246, 210, 0.05), rgba(5, 7, 13, 0.85) 90%), rgba(5, 7, 13, 0.72);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--cp-line);

  &:before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, ${({ pallete }) => accentColor(pallete)}, transparent);
    opacity: 0.7;
  }
`;

// Left side (brand + online, or back + title) yields space and truncates.
const LeftCluster = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
`;

// Right side (action buttons) must never be pushed off the popup edge.
const RightCluster = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;

  > b {
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.22em;
    color: var(--cp-text);
  }
`;

const logoIconClass = css`
  width: 26px !important;
  height: 26px !important;
  margin: 0 !important;
  filter: drop-shadow(0 0 7px rgba(0, 246, 210, 0.5));
`;

const HeadTitle = styled.h2<{ pallete: string }>`
  margin: 0;
  flex: 1 1 auto;
  min-width: 0;
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--cp-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Online = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--cp-muted);

  > i {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--cp-accent);
    box-shadow: 0 0 8px var(--cp-accent);
    animation: cp-pulse 2.4s ease-in-out infinite;
  }
`;

const hudBtnClass = css`
  width: 32px;
  height: 32px;
  display: grid !important;
  place-items: center;
  margin: 0 !important;
  padding: 0 !important;
  color: var(--cp-muted);
  border: 1px solid var(--cp-line);
  background: rgba(0, 0, 0, 0.28);
  clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px);
  transition: color 0.15s, border-color 0.15s, box-shadow 0.15s;

  &:hover {
    color: var(--cp-accent);
    border-color: var(--cp-accent);
    box-shadow: 0 0 12px -3px rgba(0, 246, 210, 0.5);
  }

  > svg {
    width: 17px;
    height: 17px;
    vertical-align: middle;
  }
`;

// ── content ─────────────────────────────────────────────────────────────────
const Content = styled.div`
  flex: 1;
  padding: 16px 14px 22px;

  :global(html[data-env='fullscreen']) & {
    padding: 22px 18px 28px;
  }
`;

// ── kebab (lock) ────────────────────────────────────────────────────────────
const Kebab = styled.div`
  position: relative;

  > .kebab {
    cursor: pointer;
    width: 32px;
    height: 32px;
    display: grid;
    place-items: center;
    border: 1px solid var(--cp-line);
    background: rgba(0, 0, 0, 0.28);
    clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px);

    div {
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background-color: var(--cp-muted);
      &:nth-child(2) {
        margin: 3px 0;
      }
    }

    &:hover {
      border-color: var(--cp-accent-2);
      div {
        background-color: var(--cp-accent-2);
      }
    }
  }

  > .burger-content {
    position: absolute;
    right: 0;
    top: 40px;
    z-index: 100;
    width: 190px;
    padding: 6px;
    background: var(--cp-panel);
    border: 1px solid var(--cp-line-2);
    clip-path: var(--cp-clip);
    box-shadow: 0 18px 40px -14px rgba(0, 0, 0, 0.8);

    .burger-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 12px;
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--cp-text);
      cursor: pointer;
      clip-path: var(--cp-clip-sm);

      > svg {
        width: 17px;
        height: 17px;
        color: var(--cp-accent-2);
      }

      &:hover {
        background: rgba(218, 104, 245, 0.1);
      }
    }
  }
`;

export const Window: React.FC<WindowProps> = ({
  title,
  primary = false,
  pallete = 'default',
  children,
  onPrevious,
  showHideButton,
  showInfoButton,
  navigateToInfo,
}) => {
  const dispatch = useDispatch();
  const isBalanceHidden = useSelector(selectIsBalanceHidden());
  const wrapperRef = useRef(null);
  const [isOpened, setIsOpened] = useState(false);
  const [menuVisible, setVisible] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const { isOutside } = useOutsideClick(wrapperRef);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOutside) {
      setIsOpened(false);
    }
  }, [isOutside]);

  const handlePrevious: React.MouseEventHandler = () => {
    navigate(-1);
  };

  const handleBackClick = !onPrevious ? handlePrevious : onPrevious;

  // Lock body scroll while menu is open so underlying content can't scroll.
  useEffect(() => {
    if (menuVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuVisible]);

  const handleMenuClick = () => {
    setVisible(true);
    setMenuClosing(false);
    setIsOpened(false);
  };

  const handleBurger = () => {
    setVisible(false);
    setIsOpened((v) => !v);
  };

  const handleCancelClick = () => {
    setMenuClosing(true);
    setTimeout(() => {
      setVisible(false);
      setMenuClosing(false);
    }, 250);
  };

  const stopWallet = () => {
    dispatch(actions.lockWallet());
  };

  const hideBalance = () => {
    dispatch(actions.hideBalances());
  };

  return (
    <ContainerStyled pallete={pallete}>
      <HeaderStyled pallete={pallete}>
        <LeftCluster>
          {primary ? (
            <>
              <Brand>
                <Logo size="icon" className={logoIconClass} />
                <b>BEAM</b>
              </Brand>
              <Online>
                <i />
                online
              </Online>
            </>
          ) : (
            <>
              <Button variant="icon" icon={AngleBackIcon} className={hudBtnClass} onClick={handleBackClick} />
              <HeadTitle pallete={pallete}>{title}</HeadTitle>
            </>
          )}
        </LeftCluster>

        <RightCluster>
          {showInfoButton && (
            <Button variant="icon" icon={InfoButton} className={hudBtnClass} onClick={navigateToInfo} />
          )}
          {showHideButton && (
            <Button
              variant="icon"
              icon={!isBalanceHidden ? IconEye : IconEyeCrossed}
              className={hudBtnClass}
              onClick={hideBalance}
            />
          )}
          {primary && (
            <>
              <Button variant="icon" icon={MenuIcon} className={hudBtnClass} onClick={handleMenuClick} />
              <Kebab>
                <div className="kebab" onClick={handleBurger} aria-hidden="true">
                  <div />
                  <div />
                  <div />
                </div>
                {isOpened && (
                  <div className="burger-content" ref={wrapperRef}>
                    <div className="burger-item" onClick={stopWallet} aria-hidden="true">
                      <IconLockWallet />
                      <span>Lock Wallet</span>
                    </div>
                  </div>
                )}
              </Kebab>
            </>
          )}
        </RightCluster>
      </HeaderStyled>

      {menuVisible && <Menu onCancel={handleCancelClick} closing={menuClosing} />}
      <Content>{children}</Content>
    </ContainerStyled>
  );
};

export default Window;
