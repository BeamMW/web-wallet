import { RefObject, useEffect, useState } from 'react';

function useOutsideClick<T extends { contains: (target: EventTarget | null) => boolean }>(ref: RefObject<T>) {
  const [isOutside, setOutside] = useState(false);

  const handleClickOutside = (event: MouseEvent) => {
    setOutside(!!ref.current && !ref.current.contains(event.target));
  };

  const setOusideValue = () => {
    setOutside(!isOutside);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  });

  return { isOutside, setOusideValue };
}

export default useOutsideClick;
