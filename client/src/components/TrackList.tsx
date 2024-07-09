import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MouseEvent, useCallback, useEffect, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { Track } from '../../../types';
import useStore from '../hooks/useStore';

export default function TrackList() {
  const { tracks, selected, queue, update } = useStore(({ tracks, selected, queue, update }) => ({ tracks, selected, queue, update }));
  const list = useMemo(() => Object.values(tracks), [tracks]);

  const clickTrack = useCallback((track: Track) => {
    update({
      selected: track.id
    });
  }, []);

  const playTrack = useCallback((track: Track) => {
    update({
      secondsPlayed: 0,
      queue: [{ ...track, first: true }]
    });
  }, []);

  const appendQueue = useCallback(
    (e: MouseEvent<HTMLDivElement>, track: Track) => {
      e.stopPropagation();

      update({ queue: [...queue, { ...track, first: !queue.length }] });
    },
    [queue]
  );

  return (
    <div className="flex h-full grow basis-0 flex-col overflow-auto">
      {list.map((track) => (
        <div
          onClick={() => clickTrack(track)}
          onDoubleClick={() => playTrack(track)}
          className={twMerge(
            'flex cursor-pointer items-center gap-4 border-b border-b-white/10 p-2 text-sm text-white hover:bg-white/10',
            selected === track.id ? 'bg-white/10' : ''
          )}
          key={track.id}
        >
          <div className="h-10 w-10 rounded-sm bg-slate-600 bg-cover" style={{ backgroundImage: `url("${track.thumbnail}")` }} />
          <div className="flex grow basis-0 items-center overflow-hidden whitespace-nowrap">
            <span className="overflow-hidden text-ellipsis">{track.name}</span>
            <div
              onDoubleClick={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => appendQueue(e, track)}
              className="ml-2 flex h-6 cursor-pointer items-center rounded-full bg-green-700 px-2 text-xs text-white hover:bg-green-600"
            >
              <FontAwesomeIcon className="mr-1" icon={faPlus} /> Queue
            </div>
          </div>
          <span className="ml-auto">
            {Math.floor(track.length / 60)}:{track.length % 60 < 10 ? '0' : ''}
            {track.length % 60}
          </span>
        </div>
      ))}
    </div>
  );
}
