import { useMemo } from 'react';

import useStore from '../hooks/useStore';

export default function Detail() {
  const { config, tracks } = useStore(({ config, tracks }) => ({ config, tracks }));
  const track = useMemo(() => tracks[config.selected], [config.selected, tracks]);

  if (!track) return false;

  return (
    <div className="flex h-full w-52 flex-col gap-4 bg-black/10 px-4 py-2 text-white">
      <div className="aspect-square w-full rounded-sm bg-slate-600 bg-cover" style={{ backgroundImage: `url("${track.thumbnail}")` }} />
      <span className="w-full text-ellipsis font-bold overflow-hidden">
        {track.name}{' '}
        <span className="ml-auto text-sm font-normal text-white/80">
          {Math.floor(track.length / 60)}:{track.length % 60 < 10 ? '0' : ''}
          {track.length % 60}
        </span>
      </span>

      <p className="text-sm text-white/80">{track.description}</p>
    </div>
  );
}
