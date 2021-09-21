import React from 'react';
import { styled } from '@linaria/react';

const ContainerStyled = styled.div`
  overflow: hidden;
  position: relative;
  width: 256px;
  height: 4px
  margin: 0 auto;
  border-radius: 2px;

  &:before {
    content: '';
    box-sizing: border-box;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }
`;

const LineStyled = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 256px;
  height: 4px;
  border-radius: 2px;
  background-color: var(--color-green);
`;

const LineActive = styled(LineStyled)<{ percent: number }>`
  width: ${({ percent }) => percent}%;
`;

const LineIntermediate = styled(LineStyled)`
  transform: translateX(-256px);
  transform-origin: left;

  &:first-child {
    animation: increase 1s infinite;
  }

  &:last-child {
    animation: decrease 1s 250ms infinite;
  }

  @keyframes increase {
    0% {
      transform: translateX(-16px) scaleX(0.0625);
    }

    100% {
      transform: translateX(384px) scaleX(1.125);
    }
  }

  @keyframes decrease {
    0% {
      transform: translateX(-96px) scalex(0.375);
    }

    100% {
      transform: translateX(320px) scalex(0.25);
    }
  }
`;

interface ProgressBarProps {
  active: boolean;
  percent: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ active, percent }) => {
  if (active) {
    return (
      <ContainerStyled>
        <LineActive percent={percent} />
      </ContainerStyled>
    );
  }

  return (
    <ContainerStyled>
      <LineIntermediate />
      <LineIntermediate />
    </ContainerStyled>
  );
};

export default ProgressBar;
