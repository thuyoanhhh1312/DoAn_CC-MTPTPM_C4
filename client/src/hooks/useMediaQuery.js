import { useEffect, useState } from 'react';

const getInitialValue = (query) => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }

  return window.matchMedia(query).matches;
};

export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => getInitialValue(query));

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return undefined;
    }

    const mediaQueryList = window.matchMedia(query);
    const onChange = (event) => setMatches(event.matches);

    setMatches(mediaQueryList.matches);
    mediaQueryList.addEventListener('change', onChange);

    return () => mediaQueryList.removeEventListener('change', onChange);
  }, [query]);

  return matches;
};
