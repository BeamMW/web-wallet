import React, { useState } from 'react';
import { styled } from '@linaria/react';

import Title from './Title';
import Angle from './Angle';

interface SectionProps {
  title?: string;
  subtitle?: string;
  collapse?: boolean;
  variant?: 'regular' | 'gray';
  showAllAction?: () => void;
  defaultCollapseState?: boolean;
  children?: React.ReactNode;
}

const SectionStyled = styled.div`
  position: relative;
  margin: 0;
  padding-top: 18px;
  text-align: left;

  > .cancel-button {
    position: absolute;
    top: 68px;
    right: 12px;
    cursor: pointer;
  }

  > .send-input {
    width: 100%;
  }
`;

const SectionGrayStyled = styled.div`
  position: relative;
  margin: 0 0 16px;
  padding: 16px;
  border: 1px solid var(--cp-line);
  clip-path: var(--cp-clip);
  background-color: rgba(255, 255, 255, 0.02);
  text-align: left;

  > .full-address-button {
    position: absolute;
    top: 62px;
    cursor: pointer;
    margin: 0;
    right: 14px;
  }

  > .cancel-button {
    position: absolute;
    top: 66px;
    right: 40px;
    cursor: pointer;
  }
  > .send-input {
    width: 100%;
  }
`;

const ButtonStyled = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  cursor: pointer;
  border: none;
  background-color: transparent;
  text-decoration: none;
  color: white;
  white-space: nowrap;
`;

const ShowAll = styled.div`
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-align: center;
  color: var(--cp-accent);
  cursor: pointer;

  &:hover {
    text-shadow: 0 0 10px rgba(0, 246, 210, 0.5);
  }
`;

const TitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const Section: React.FC<SectionProps> = ({
  title,
  collapse = false,
  variant = 'regular',
  subtitle,
  children,
  showAllAction,
  defaultCollapseState,
}) => {
  const [hidden, setHidden] = useState(defaultCollapseState ?? collapse);

  const handleMouseDown: React.MouseEventHandler = () => {
    setHidden(!hidden);
  };

  const SectionComponent = {
    regular: SectionStyled,
    gray: SectionGrayStyled,
  }[variant];

  return (
    <SectionComponent>
      {collapse && (
        <ButtonStyled type="button" onMouseDown={handleMouseDown}>
          <Angle value={hidden ? 180 : 0} margin={hidden ? 3 : 3} />
        </ButtonStyled>
      )}
      {!!title && (
        <TitleWrapper>
          <Title>{title}</Title>
          {showAllAction && <ShowAll onClick={showAllAction}>Show All</ShowAll>}
        </TitleWrapper>
      )}
      {!!subtitle && <Title variant="subtitle">{subtitle}</Title>}
      {!hidden && children}
    </SectionComponent>
  );
};

export default Section;
