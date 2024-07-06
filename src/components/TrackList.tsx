import { useCallback, useMemo } from 'react';
import { Track } from 'src/types';
import { twMerge } from 'tailwind-merge';

import useStore from '../hooks/useStore';

export default function TrackList() {
  const { tracks, config, update } = useStore(({ tracks, config, update }) => ({ tracks, config, update }));
  const list = useMemo(() => Object.values(tracks), [tracks]);

  const clickTrack = useCallback((track: Track) => {
    update({
      config: {
        ...config,
        selected: track.id
      }
    });
  }, []);

  const playTrack = useCallback((track: Track) => {
    update({
      secondsPlayed: 0,
      queue: [{ ...track }]
    });
  }, []);

  return (
    <div className="flex h-full grow basis-0 flex-col overflow-auto">
      {list.map((track) => (
        <div
          onClick={() => clickTrack(track)}
          onDoubleClick={() => playTrack(track)}
          className={twMerge(
            'flex cursor-pointer items-center gap-4 border-b border-b-white/10 p-2 text-sm text-white hover:bg-white/10',
            config.selected === track.id ? 'bg-white/10' : ''
          )}
          key={track.id}
        >
          <div className="h-10 w-10 rounded-sm bg-slate-600 bg-cover" style={{ backgroundImage: `url("${track.thumbnail}")` }} />
          <span className="flex grow basis-0 items-center overflow-hidden whitespace-nowrap">
            <span className="w-full overflow-hidden text-ellipsis">{track.name}</span>
          </span>
          <span className="ml-auto">
            {Math.floor(track.length / 60)}:{track.length % 60 < 10 ? '0' : ''}
            {track.length % 60}
          </span>
        </div>
      ))}
    </div>
  );
}
