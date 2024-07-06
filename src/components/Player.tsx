import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import useStore from '../hooks/useStore';

export default function Player() {
  const [mouseX, setMouseX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const audioElem = useRef<HTMLAudioElement | null>(null);
  const progressElem = useRef<HTMLDivElement | null>(null);
  const { queue, config, update, artists, secondsPlayed } = useStore(({ queue, artists, config, update, secondsPlayed }) => ({
    queue,
    config,
    update,
    artists,
    secondsPlayed
  }));
  const track = useMemo(() => queue[0], [queue]);
  const fullSeconds = useMemo(() => Math.floor(secondsPlayed), [secondsPlayed]);

  const clickPlay = useCallback(() => {
    if (!track) return;

    if (config.playing) audioElem.current?.pause();
    else audioElem.current?.play();
  }, [track, config.playing]);

  const onPlaying = useCallback(() => update({ config: { ...config, playing: true } }), [config]);

  const onPause = useCallback(() => update({ config: { ...config, playing: false } }), [config]);

  const onDrag = useCallback((e: MouseEvent) => {
    const { left } = progressElem.current.getBoundingClientRect();

    setMouseX(Math.max(0, Math.min(1, (e.pageX - left) / progressElem.current.clientWidth)));
  }, []);

  const onStartDragging = useCallback(() => {
    if (!track) return;

    setDragging(true);
  }, [setDragging, track]);

  const onStopDragging = useCallback(() => {
    if (!dragging || !track) return;

    audioElem.current.currentTime = track.length * mouseX;

    update({ secondsPlayed: track.length * mouseX });

    setDragging(false);
  }, [update, track, setDragging, dragging, mouseX]);

  useEffect(() => {
    if (!track) return;

    audioElem.current.setAttribute('src', track.url);

    update({ secondsPlayed: 0 });

    audioElem.current.play();
  }, [track, update]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      update({ secondsPlayed: audioElem.current?.currentTime });
    }, 100);

    return () => clearInterval(interval);
  }, [update]);

  const percentage = useMemo(() => {
    if (!track) return 0;

    if (dragging) return mouseX * 100;

    return (secondsPlayed / track.length) * 100;
  }, [dragging, track, secondsPlayed, mouseX]);

  return (
    <div
      className="flex h-24 w-full items-center justify-center bg-black"
      onMouseMove={onDrag}
      onMouseUp={onStopDragging}
      onMouseLeave={onStopDragging}
    >
      <div className="flex h-full w-60 items-center gap-4 pl-4">
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
          className="mb-1 flex aspect-square w-10 cursor-pointer items-center justify-center rounded-full bg-[#f5a449] text-xl text-[#333] hover:bg-[#f7b266] hover:text-[#444]"
          onClick={clickPlay}
        >
          <FontAwesomeIcon icon={config.playing ? faPause : faPlay} />
        </div>
        <div className="flex w-full items-center text-sm text-white/50">
          <div className="pr-2">
            {Math.floor(fullSeconds / 60)}:{fullSeconds < 10 ? '0' : ''}
            {fullSeconds % 60}
          </div>
          <div ref={progressElem} onMouseDown={onStartDragging} className="group relative grow basis-0 cursor-pointer py-1">
            <div className="pointer-events-none h-1 w-full overflow-hidden rounded-sm bg-white/20">
              <div
                className={twMerge('h-full bg-white group-hover:bg-[#f7b266]', dragging ? 'bg-[#f7b266]' : '')}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div
              className="pointer-events-none absolute top-0 h-3 w-3 -translate-x-1 cursor-pointer rounded-full bg-white"
              style={{ left: `${percentage}%` }}
            />
          </div>
          <div className="pl-2">
            {Math.floor((track?.length || 0) / 60)}:{(track?.length || 0) % 60 < 10 ? '0' : ''}
            {(track?.length || 0) % 60}
          </div>
        </div>
      </div>
      <div className="flex w-60 justify-end">VOLUME</div>
      <audio onPlaying={onPlaying} onPause={onPause} ref={audioElem} src="/dreams.mp3" />
    </div>
  );
}
