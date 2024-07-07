import { faPause, faPlay, faVolumeHigh, faVolumeLow, faVolumeMute, faVolumeOff, faVolumeXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MouseEvent, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import useStore from '../hooks/useStore';

export default function Player() {
  const [mouseX, setMouseX] = useState(0);
  const audioElem = useRef<HTMLAudioElement | null>(null);
  const selectedElem = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState<'played' | 'volume' | ''>('');
  const { queue, playing, volume, muted, update, artists, secondsPlayed } = useStore(
    ({ queue, artists, playing, volume, muted, update, secondsPlayed }) => ({
      queue,
      playing,
      volume,
      muted,
      update,
      artists,
      secondsPlayed
    })
  );
  const track = useMemo(() => queue[0], [queue]);

  const clickPlay = useCallback(() => {
    if (!track) return;

    if (playing) audioElem.current?.pause();
    else audioElem.current?.play();
  }, [track, playing]);

  const onPlaying = useCallback(() => update({ playing: true }), [update]);

  const onPause = useCallback(() => update({ playing: false }), [update]);

  const onDrag = useCallback(
    (e: MouseEvent, forceDrag?: 'volume' | 'played') => {
      if (!selectedElem.current) return;

      const { left } = selectedElem.current.getBoundingClientRect();

      const progress = Math.max(0, Math.min(1, (e.pageX - left) / selectedElem.current.clientWidth));

      setMouseX(progress);

      // forceDrag will be used instead of dragging if provided
      // this allows onStartDragging() to skip the React render cycle
      if ((forceDrag || dragging) === 'volume') update({ volume: progress });
    },
    [dragging]
  );

  const onStartDragging = useCallback(
    (e: MouseEvent, type: 'played' | 'volume') => {
      if (type === 'played' && !track) return;

      selectedElem.current = e.target as HTMLDivElement;

      setDragging(type);

      onDrag(e, type);
    },
    [setDragging, onDrag, track]
  );

  const onStopDragging = useCallback(() => {
    if (!dragging) return;

    if (dragging === 'played' && track) {
      audioElem.current.currentTime = track.length * mouseX;

      update({ secondsPlayed: track.length * mouseX });
    }

    if (dragging === 'volume') update({ volume: mouseX });

    setDragging('');
  }, [update, track, setDragging, dragging, mouseX]);

  useEffect(() => {
    if (!track) return;

    audioElem.current.setAttribute('src', track.url);

    update({ secondsPlayed: 0 });

    audioElem.current.play();
  }, [track, update]);

  useLayoutEffect(() => {
    audioElem.current.volume = volume;

    localStorage.setItem('volume', `${volume}`);
  }, [volume]);

  useLayoutEffect(() => {
    audioElem.current.muted = muted;

    localStorage.setItem('muted', muted ? 'yes' : '');
  }, [muted]);

  useLayoutEffect(() => {
    const interval = window.setInterval(() => {
      update({ secondsPlayed: audioElem.current.currentTime });
    }, 100);

    return () => clearInterval(interval);
  }, [update]);

  const playedProgress = useMemo(() => {
    if (!track) return 0;

    if (dragging === 'played') return mouseX * 100;

    return (secondsPlayed / track.length) * 100;
  }, [dragging, track, secondsPlayed, mouseX]);

  const fullSeconds = useMemo(() => {
    if (dragging !== 'played') return Math.floor(secondsPlayed);

    return Math.floor((track.length * playedProgress) / 100);
  }, [dragging, track, playedProgress, secondsPlayed]);

  const volumeProgress = useMemo(() => {
    if (dragging === 'volume') return mouseX * 100;

    return volume * 100;
  }, [dragging, volume, mouseX]);

  const volumeIcon = useMemo(() => {
    if (muted) return faVolumeXmark;

    if (volumeProgress > 50) return faVolumeHigh;

    if (volumeProgress > 0) return faVolumeLow;

    return faVolumeOff;
  }, [volumeProgress, muted]);

  return (
    <div
      className="flex h-20 w-full items-center justify-center bg-black"
      onMouseMove={onDrag}
      onMouseUp={onStopDragging}
      onMouseLeave={onStopDragging}
    >
      <div className="flex h-full w-52 items-center gap-4 pl-4">
        {track && (
          <>
            <div className="h-10 w-10 rounded-sm bg-slate-600 bg-cover" style={{ backgroundImage: `url("${track.thumbnail}")` }} />
            <span className="flex grow basis-0 flex-col overflow-hidden text-sm text-white">
              <span className="mb-0.5 w-full overflow-hidden text-ellipsis whitespace-nowrap">{track.name}</span>
              <span className="text-xs text-white/50">{track.artists.map((id) => artists[id].name).join(', ')}</span>
            </span>
          </>
        )}
      </div>
      <div className="flex grow basis-0 flex-col items-center px-4">
        <div
          className="mb-1 flex aspect-square w-8 cursor-pointer items-center justify-center rounded-full bg-[#f5a449] text-base text-[#333] hover:bg-[#f7b266] hover:text-[#444]"
          onClick={clickPlay}
        >
          <FontAwesomeIcon icon={playing ? faPause : faPlay} />
        </div>
        <div className="flex w-full items-center text-xs text-white/50">
          <div className="pr-2">
            {Math.floor(fullSeconds / 60)}:{fullSeconds % 60 < 10 ? '0' : ''}
            {fullSeconds % 60}
          </div>
          <div onMouseDown={(e) => onStartDragging(e, 'played')} className="group relative grow basis-0 cursor-pointer py-1">
            <div className="pointer-events-none h-1 w-full overflow-hidden rounded-sm bg-white/20">
              <div
                className={twMerge('h-full bg-white group-hover:bg-[#f7b266]', dragging === 'played' ? 'bg-[#f7b266]' : '')}
                style={{ width: `${playedProgress}%` }}
              />
            </div>
            <div
              className="pointer-events-none absolute top-0 h-3 w-3 -translate-x-1 cursor-pointer rounded-full bg-white"
              style={{ left: `${playedProgress}%` }}
            />
          </div>
          <div className="pl-2">
            {Math.floor((track?.length || 0) / 60)}:{(track?.length || 0) % 60 < 10 ? '0' : ''}
            {(track?.length || 0) % 60}
          </div>
        </div>
      </div>
      <div className="flex w-52 items-center justify-end px-4">
        <div
          onClick={() => update({ muted: !muted, volume: muted && !volume ? 0.5 : volume })}
          className="w-5 cursor-pointer text-sm text-white/50 hover:text-white"
        >
          <FontAwesomeIcon icon={volumeIcon} />
        </div>
        <div onMouseDown={(e) => onStartDragging(e, 'volume')} className="group relative grow basis-0 cursor-pointer py-1">
          <div className="pointer-events-none h-1 w-full overflow-hidden rounded-sm bg-white/20">
            <div
              className={twMerge('h-full bg-white group-hover:bg-[#f7b266]', dragging === 'volume' ? 'bg-[#f7b266]' : '')}
              style={{ width: `${volumeProgress}%` }}
            />
          </div>
          <div
            className="pointer-events-none absolute top-0 h-3 w-3 -translate-x-1 cursor-pointer rounded-full bg-white"
            style={{ left: `${volumeProgress}%` }}
          />
        </div>
      </div>
      <audio onPlaying={onPlaying} onPause={onPause} ref={audioElem} />
    </div>
  );
}
