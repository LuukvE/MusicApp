import { useCallback } from 'react';

import { artists, tracks } from '../constants';
import useStore from './useStore';

export default () => {
  const update = useStore((state) => state.update);

  const load = useCallback(() => {
    update({ tracks, artists });
  }, [update]);

  return { load };
};
