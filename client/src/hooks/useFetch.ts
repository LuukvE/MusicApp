import { useCallback } from 'react';

import useStore from './useStore';

export default () => {
  const update = useStore((state) => state.update);

  const load = useCallback(async () => {
    const raw = await fetch('http://localhost:8080');

    if (raw.status !== 200) return null;

    const body = await raw.json();

    update(body);

    return body;
  }, []);

  return { load };
};
