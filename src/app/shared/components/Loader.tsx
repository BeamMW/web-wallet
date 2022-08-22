import React from 'react';
import Logo from '@app/shared/components/Logo';
import { styled } from '@linaria/react';

const LoaderWrapper = styled.div`
  position: absolute;
  background: black;
  opacity: 0.5;
  width: 100%;
  height: 100%;
  left: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0;

  svg {
    animation: rotation 2s infinite linear;
  }

  @keyframes rotation {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(359deg);
    }
  }
`;

const Loader = () => (
  <LoaderWrapper>
    <Logo />
  </LoaderWrapper>
);

export default Loader;
