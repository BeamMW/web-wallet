import React, { useEffect, useRef, useState } from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';
import {
  IconEye, IconLockWallet, MenuIcon, IconEyeCrossed,
} from '@app/shared/icons';

import { useNavigate } from 'react-router-dom';

import useOutsideClick from '@app/shared/hooks/OutsideClickHook';
import { useDispatch, useSelector } from 'react-redux';
import { actions } from '@app/shared/store';
import { selectIsBalanceHidden } from '@app/shared/store/selectors';
import Logo from './Logo';
import BackButton from './BackButton';
import Title from './Title';
import Button from './Button';
import Menu from './Menu';

interface WindowProps {
  title?: string;
  primary?: boolean;
  pallete?: 'default' | 'blue' | 'purple';
  onPrevious?: React.MouseEventHandler | undefined;
}

function getColor(pallete: string): string {
  switch (pallete) {
    case 'blue':
      return 'var(--color-blue)';
    case 'purple':
      return 'var(--color-purple)';
    default:
      return '#035b8f';
  }
}

const ContainerStyled = styled.div<WindowProps>`
  position: relative;
  min-height: 600px;
  padding: 130px 30px 30px;
  text-align: center;

  &:before {
    content: '';
    position: absolute;
    z-index: -1;
    top: 50px;
    left: 0;
    width: 100%;
    height: 100px;
    background-image: linear-gradient(to top, rgba(3, 91, 143, 0), ${({ pallete }) => getColor(pallete)} 150%);
  }
`;

const HeadingStyled = styled.div<{ pallete: string }>`
  position: fixed;
  z-index: 2;
  top: 0;
  left: 0;
  overflow: hidden;
  width: 375px;
  height: 130px;
  padding-top: 50px;
  background-color: var(--color-dark-blue);

  &:before {
    content: '';
    position: absolute;
    z-index: -1;
    top: 50px;
    left: 0;
    width: 100%;
    height: 100px;
    background-image: linear-gradient(to top, rgba(3, 91, 143, 0), ${({ pallete }) => getColor(pallete)} 150%);
  }
`;

const FrameStyled = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 375px;
  height: 42px;
  text-align: left;
`;

const menuButtonStyle = css`
  position: fixed;
  z-index: 3;
  top: 74px;
  left: 12px;
  margin: 0;
`;

const menuEyeStyle = css`
  position: fixed;
  z-index: 3;
  top: 74px;
  right: 12px;
  margin: 0;
`;

const OnlineWrapper = styled.div`
  position: absolute;
  top: 17px;
  width: 250px;
  display: inline-block;
  > svg {
    margin: 0 30px;
  }
  > .online-ico {
    width: 10px;
    height: 10px;
    margin: 0 10px 0 0;
    box-shadow: 0 0 5px 0 rgba(0, 246, 210, 0.7);
    background-color: #00f6d2;
    border-radius: 50%;
    display: inline-block;
  }
  > .online-text {
    font-size: 14px;
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: normal;
    color: #8da1ad;
  }
`;

const BurgerWrapper = styled.div`
  position: absolute;
  top: 17px;
  right: 10px;
  > .kebab {
    cursor: pointer;
    width: 24px;
    height: 24px;
    align-items: center;
    display: flex;
    flex-direction: column;
    div {
      background-color: #92abba;
      width: 3px;
      height: 3px;
      border-radius: 50%;
      :nth-child(2) {
        margin: 3px 0;
      }
    }
  }
  > .burger-content {
    padding: 20px 0;
    border-radius: 10px;
    box-shadow: 2px 2px 10px 0 rgba(0, 0, 0, 0.14);
    background-color: #003f6f;
    width: 205px;
    position: absolute;
    right: 8px;
    top: 16px;
    z-index: 100;
    .burger-item {
      display: flex;
      align-items: center;
      padding: 10px 20px;
      font-size: 16px;
      font-weight: normal;
      font-stretch: normal;
      font-style: normal;
      line-height: normal;
      letter-spacing: normal;
      color: #fff;
      cursor: pointer;
      opacity: 0.8;
      &:hover {
        opacity: 1;
        background: #114b77;
      }
      span {
        margin-left: 14px;
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
}) => {
  const dispatch = useDispatch();
  const isBalanceHidden = useSelector(selectIsBalanceHidden());
  const wrapperRef = useRef(null);
  const [isOpened, setIsOpened] = useState(false);
  const [menuVisible, setVisible] = useState(false);
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

  const handleMenuClick = () => {
    setVisible(true);
    setIsOpened(false);
  };

  const handleBurger = () => {
    setVisible(false);
    setIsOpened((v) => !v);
  };

  const handleCancelClick = () => setVisible(false);

  const stopWallet = () => {
    dispatch(actions.lockWallet());
  };

  const hideBalance = () => {
    dispatch(actions.hideBalances());
  };

  return (
    <ContainerStyled pallete={pallete}>
      <HeadingStyled pallete={pallete}>
        <FrameStyled>
          <Logo size="icon" />
          <OnlineWrapper>
            <span className="online-ico" />
            <span className="online-text">online</span>
          </OnlineWrapper>
          <BurgerWrapper>
            <div className="kebab" onClick={() => handleBurger()} aria-hidden="true">
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
          </BurgerWrapper>
        </FrameStyled>
        <Title variant="heading">{title}</Title>
        {title === 'Wallet' && (
          <Button
            variant="icon"
            icon={!isBalanceHidden ? IconEye : IconEyeCrossed}
            className={menuEyeStyle}
            onClick={hideBalance}
          />
        )}
      </HeadingStyled>
      {primary ? (
        <Button variant="icon" icon={MenuIcon} className={menuButtonStyle} onClick={handleMenuClick} />
      ) : (
        <BackButton onClick={handleBackClick} />
      )}
      {menuVisible && <Menu onCancel={handleCancelClick} />}
      {children}
    </ContainerStyled>
  );
};

export default Window;
