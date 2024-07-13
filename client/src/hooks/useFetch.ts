import { useCallback } from 'react';

import useStore from './useStore';

export default () => {
  const update = useStore((state) => state.update);

  const load = useCallback(() => {
    fetch('http://localhost:8080').then(async (raw) => {
      const { tracks, artists } = await raw.json();

      update({ tracks, artists });
    });
  }, []);

  return { load };
};
