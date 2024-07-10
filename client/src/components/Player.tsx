import {
  faChevronLeft,
  faChevronRight,
  faList,
  faPause,
  faPlay,
  faRepeat,
  faShuffle,
  faVolumeHigh,
  faVolumeLow,
  faVolumeOff,
  faVolumeXmark
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { twMerge } from 'tailwind-merge';

import usePlayer from '../hooks/usePlayer';
import useStore from '../hooks/useStore';

export default function Player() {
  const { playing, volume, muted, update, artists, shuffle, repeat, queue, selected } = useStore(
    ({ queue, artists, playing, volume, muted, update, shuffle, repeat, secondsPlayed, selected }) => ({
      queue,
      playing,
      volume,
      muted,
      shuffle,
      repeat,
      update,
      artists,
      selected,
      secondsPlayed
    })
  );

  const {
    track,
    goPrev,
    goNext,
    onDrag,
    onPause,
    dragging,
    disabled,
    onPlaying,
    clickPlay,
    audioElem,
    clickRepeat,
    fullSeconds,
    clickShuffle,
    volumeProgress,
    onStopDragging,
    playedProgress,
    onStartDragging
  } = usePlayer();

  const volumeIcon = (() => {
    if (muted) return faVolumeXmark;

    if (volumeProgress > 50) return faVolumeHigh;

    if (volumeProgress > 0) return faVolumeLow;

    return faVolumeOff;
  })();

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
        <div className="flex items-center">
          <FontAwesomeIcon
            onClick={clickShuffle}
            className={twMerge(
              'cursor-pointer px-4 py-2 text-white/70 hover:text-white',
              !track ? 'pointer-events-none text-white/20' : '',
              track && shuffle ? 'text-[#f5a449] hover:text-[#f7b266]' : ''
            )}
            icon={faShuffle}
          />
          <FontAwesomeIcon
            onClick={goPrev}
            className={twMerge('cursor-pointer px-4 py-2 text-white/70 hover:text-white', disabled.goPrev ? 'pointer-events-none text-white/20' : '')}
            icon={faChevronLeft}
          />
          <div
            className="mb-1 flex aspect-square w-8 cursor-pointer items-center justify-center rounded-full bg-[#f5a449] text-base text-[#333] hover:bg-[#f7b266] hover:text-[#444]"
            onClick={clickPlay}
          >
            <FontAwesomeIcon icon={playing ? faPause : faPlay} />
          </div>
          <FontAwesomeIcon
            onClick={goNext}
            className={twMerge('cursor-pointer px-4 py-2 text-white/70 hover:text-white', disabled.goNext ? 'pointer-events-none text-white/20' : '')}
            icon={faChevronRight}
          />
          <div
            onClick={clickRepeat}
            className={twMerge(
              'relative cursor-pointer px-4 py-2 text-white/70 hover:text-white',
              !track ? 'pointer-events-none text-white/20' : '',
              track && repeat !== 'none' ? 'text-[#f5a449] hover:text-[#f7b266]' : ''
            )}
          >
            <FontAwesomeIcon icon={faRepeat} />

            {repeat === 'track' && (
              <span className="absolute bottom-2 left-[52%] flex w-2.5 items-center justify-center rounded-xl bg-[#f5a449] text-[10px] font-bold leading-none text-black">
                1
              </span>
            )}
          </div>
        </div>
        <div className="flex w-full items-center text-xs text-white/50">
          <div className="pr-3">
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
          <div className="pl-3">
            {Math.floor((track?.length || 0) / 60)}:{(track?.length || 0) % 60 < 10 ? '0' : ''}
            {(track?.length || 0) % 60}
          </div>
        </div>
      </div>
      <div className="flex w-52 items-center justify-end px-4">
        <FontAwesomeIcon
          onClick={() => update({ selected: null })}
          className={twMerge(
            'cursor-pointer px-4 py-2 text-white/70 hover:text-white',
            !queue.length ? 'pointer-events-none text-white/20' : '',
            !selected && !!queue.length ? 'text-[#f5a449] hover:text-[#f7b266]' : ''
          )}
          icon={faList}
        />
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
