import React from 'react';
import { styled } from '@linaria/react';
import { css, cx } from '@linaria/core';

const intermediateCss = css`
  &:before {
    animation: swoosh 2s infinite linear;
  }

  &:after {
    animation: swoosh 2s 1400ms infinite linear;
  }

  @keyframes swoosh {
    0% {
      left: 0;
      width: 0%;
    }

    25% {
      left: 50%;
      width: 50%;
    }

    50% {
      left: 100%;
      width: 0%;
    }

    100% {
      left: 100%;
      width: 0%;
    }
  }
`;

const ContainerStyled = styled.div`
  position: relative;
  width: 256px;
  height: 4px;
  margin: 0 auto;
  border: 1px solid var(--color-ghost);
  border-radius: 2px;
`;

const ProgressBarStyled = styled.div<{ percent: number }>`
  &:before,
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 4px;
    border-radius: 2px;
    background-color: var(--color-green);
    box-shadow: 0 0 5px 0 rgba(0, 246, 210, 0.7);
  }

  &:after {
    width: ${({ percent }) => percent}%;
  }
`;

interface ProgressBarProps {
  active: boolean;
  percent: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ active, percent }) => {
  return (
    <ContainerStyled>
      <ProgressBarStyled
        percent={percent}
        className={cx(!active && intermediateCss)}
      />
    </ContainerStyled>
  );
};

export default ProgressBar;
