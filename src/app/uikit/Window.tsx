import React, { useState } from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';

import { gotoBack } from '@app/model/view';
import { isNil } from '@app/core/utils';
import { MenuIcon } from '@app/icons';

import Logo from './Logo';
import BackButton from './BackButton';
import Title from './Title';
import Button from './Button';
import Menu from './Menu';

interface WindowProps {
  title?: string;
  primary?: boolean;
  pallete?: 'default' | 'blue' | 'purple';
  onPrevious?: React.MouseEventHandler;
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
    background-image: linear-gradient(
      to top, rgba(3, 91, 143, 0), ${({ pallete }) => getColor(pallete)} 150%
    );
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
    background-image: linear-gradient(
      to top, rgba(3, 91, 143, 0), ${({ pallete }) => getColor(pallete)} 150%
    );
  }
`;

const FrameStyled = styled.div`
  overflow: hidden;
  position: absolute;
  top: 10px;
  left: 50%;
  width: 42px;
  height: 30px;
  transform: translateX(-50%);
`;

const menuButtonStyle = css`
  position: fixed;
  z-index: 3;
  top: 74px;
  left: 24px;
  margin: 0;
`;

export const Window: React.FC<WindowProps> = ({
  title,
  primary = false,
  pallete = 'default',
  children,
  onPrevious,
}) => {
  const [menuVisible, setVisible] = useState(false);

  const handleBackClick = isNil(onPrevious) ? gotoBack : onPrevious;
  const handleMenuClick = () => setVisible(true);
  const handleCancelClick = () => setVisible(false);

  return (
    <ContainerStyled pallete={pallete}>
      <HeadingStyled pallete={pallete}>
        <FrameStyled>
          <Logo size="icon" />
        </FrameStyled>
        <Title variant="heading">{title}</Title>
      </HeadingStyled>
      { primary ? (
        <Button
          variant="icon"
          icon={MenuIcon}
          className={menuButtonStyle}
          onClick={handleMenuClick}
        />
      ) : (
        <BackButton onClick={handleBackClick} />
      ) }
      { menuVisible && <Menu onCancel={handleCancelClick} />}
      {children}
    </ContainerStyled>
  );
};

export default Window;
