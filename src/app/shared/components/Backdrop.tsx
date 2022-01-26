import React, { useRef } from 'react';
import { styled } from '@linaria/react';

interface BackDropProps {
  onCancel?: React.MouseEventHandler;
}

const BackdropStyled = styled.div`
  position: fixed;
  z-index: 3;
  top: 50px;
  left: 0;
  width: 100%;
  height: 550px;
  background-color: rgba(3, 36, 68, 0.3);
`;

const BackDrop: React.FC<BackDropProps> = ({ onCancel, children }) => {
  const rootRef = useRef();

  const handleOutsideClick = (event) => {
    if (event.target === rootRef.current) {
      onCancel(event);
    }
  };

  return (
    <BackdropStyled ref={rootRef} onClick={handleOutsideClick}>
      {children}
    </BackdropStyled>
  );
};

export default BackDrop;
