import { useCallback } from 'react';
import { twMerge } from 'tailwind-merge';

import { QueueTrack } from '../../../types';
import useStore from '../hooks/useStore';

export default function Queue() {
  const { repeat, queue, update } = useStore(({ tracks, selected, queue, repeat, update }) => ({ tracks, selected, queue, repeat, update }));
  const indexOfFirst = queue.findIndex((t) => !!t.first);

  const skipTo = useCallback(
    (track: QueueTrack) => {
      const index = queue.indexOf(track);

      if (index === 0) return update({ secondsPlayed: 0 });

      const payload = [...queue];
      const skipped = payload.splice(0, index);

      update({
        secondsPlayed: 0,
        queue: [...payload, ...skipped]
      });
    },
    [queue, update]
  );

  if (!queue.length) return false;

  return (
    <div className="flex h-full w-52 flex-col overflow-auto">
      {queue.map((track, index) => {
        if (repeat === 'none' && indexOfFirst && index >= indexOfFirst) return false;

        return (
          <div
            key={index}
            onDoubleClick={() => skipTo(track)}
            className={twMerge(
              'flex cursor-pointer items-center gap-4 border-b border-b-white/10 p-2 text-sm text-white hover:bg-white/10',
              !index ? 'bg-white/10' : ''
            )}
          >
            <div className="h-10 w-10 rounded-sm bg-slate-600 bg-cover" style={{ backgroundImage: `url("${track.thumbnail}")` }} />
            <div className="flex grow basis-0 items-center overflow-hidden whitespace-nowrap">
              <span className="overflow-hidden text-ellipsis">{track.name}</span>
            </div>
            <span className="ml-auto">
              {Math.floor(track.length / 60)}:{track.length % 60 < 10 ? '0' : ''}
              {track.length % 60}
            </span>
          </div>
        );
      })}
    </div>
  );
}
