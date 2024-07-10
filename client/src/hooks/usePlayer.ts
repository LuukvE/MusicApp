import { MouseEvent, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { Repeat } from '../../../types';
import useStore from '../hooks/useStore';

export default function usePlayer() {
  const [mouseX, setMouseX] = useState(0);
  const audioElem = useRef<HTMLAudioElement | null>(null);
  const selectedElem = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState<'played' | 'volume' | ''>('');

  const { queue, playing, repeat, shuffle, volume, muted, tracks, update, secondsPlayed } = useStore(
    ({ queue, playing, repeat, shuffle, volume, muted, tracks, update, secondsPlayed }) => ({
      queue,
      volume,
      muted,
      tracks,
      update,
      playing,
      repeat,
      shuffle,
      secondsPlayed
    })
  );

  const track = queue[0];
  const disabled = {
    goPrev: !queue.length || (repeat === 'none' && !!queue[0].first),
    goNext: !queue.length || (repeat === 'none' && (!queue[1] || !!queue[1].first))
  };

  const onPlaying = () => update({ playing: true });

  const onPause = () => update({ playing: false });

  const clickPlay = () => {
    if (!track) return;

    if (playing) audioElem.current?.pause();
    else audioElem.current?.play();
  };

  const clickShuffle = () => {
    if (!queue.length) return;

    const ids = queue.map((t) => t.id);

    const first = ids.shift();

    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }

    ids.unshift(first);

    const payload = ids.map((id, i) => ({
      ...tracks[id],
      first: i === ids.length - 1
    }));

    update({ shuffle: !shuffle, queue: payload });
  };

  const clickRepeat = () => {
    const map: Record<Repeat, Repeat> = {
      none: 'queue',
      queue: 'track',
      track: 'none'
    };

    update({ repeat: map[repeat] });
  };

  const onDrag = (e: MouseEvent, forceDrag?: 'volume' | 'played') => {
    if (!selectedElem.current) return;

    const { left } = selectedElem.current.getBoundingClientRect();

    const progress = Math.max(0, Math.min(1, (e.pageX - left) / selectedElem.current.clientWidth));

    setMouseX(progress);

    // forceDrag will be used instead of dragging if provided
    // this allows onStartDragging() to skip the React render cycle
    if ((forceDrag || dragging) === 'volume') update({ volume: progress });
  };

  const onStartDragging = (e: MouseEvent, type: 'played' | 'volume') => {
    if (type === 'played' && !track) return;

    selectedElem.current = e.target as HTMLDivElement;

    setDragging(type);

    onDrag(e, type);
  };

  const onStopDragging = () => {
    if (!dragging) return;

    if (dragging === 'played' && track) {
      audioElem.current.currentTime = track.length * mouseX;

      update({ secondsPlayed: track.length * mouseX });
    }

    if (dragging === 'volume') update({ volume: mouseX });

    setDragging('');
  };

  const goPrev = () => {
    if (!queue.length) return;

    const payload = [...queue];

    payload.unshift(payload.pop());

    update({ queue: payload });
  };

  const goNext = () => {
    if (!queue.length) return;

    const payload = [...queue];
    const current = payload.shift();

    if (shuffle && current.first) {
      for (let i = payload.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [payload[i], payload[j]] = [payload[j], payload[i]];
      }
    }

    payload.push(current);

    update({ queue: payload });
  };

  const playedProgress = (() => {
    if (!track) return 0;

    if (dragging === 'played') return mouseX * 100;

    return (secondsPlayed / track.length) * 100;
  })();

  const fullSeconds = (() => {
    if (dragging !== 'played') return Math.floor(secondsPlayed);

    return Math.floor((track.length * playedProgress) / 100);
  })();

  const volumeProgress = (() => {
    if (dragging === 'volume') return mouseX * 100;

    return volume * 100;
  })();

  useEffect(() => {
    if (!track) return;

    audioElem.current.setAttribute('src', track.url);

    update({ secondsPlayed: 0 });

    audioElem.current.play();
  }, [track?.id, update]);

  // Automatically play next track in queue
  useEffect(() => {
    if (playedProgress < 100) return;

    update({ secondsPlayed: 0 });

    if (!disabled.goNext && repeat !== 'track') goNext();

    if (repeat === 'track') audioElem.current.play();
  }, [playedProgress, repeat, disabled, goNext]);

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

  return {
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
  };
}
