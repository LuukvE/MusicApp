import { MouseEvent, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

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

  const track = useMemo(() => queue[0], [queue]);

  const disabled = useMemo(
    () => ({
      goPrev: !queue.length || (repeat === 'none' && !!queue[0].first),
      goNext: !queue.length || (repeat === 'none' && (!queue[1] || !!queue[1].first))
    }),
    [queue, repeat]
  );

  const onPlaying = useCallback(() => update({ playing: true }), []);

  const onPause = useCallback(() => update({ playing: false }), []);

  const clickPlay = useCallback(() => {
    fetch('http://localhost:8080/lala');

    if (!track) return;

    if (playing) audioElem.current?.pause();
    else audioElem.current?.play();
  }, [track, playing]);

  const clickShuffle = useCallback(() => {
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
  }, [queue]);

  const clickRepeat = useCallback(() => {
    const map: Record<Repeat, Repeat> = {
      none: 'queue',
      queue: 'track',
      track: 'none'
    };

    update({ repeat: map[repeat] });
  }, [repeat]);

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
    [onDrag]
  );

  const onStopDragging = useCallback(() => {
    if (!dragging) return;

    if (dragging === 'played' && track) {
      audioElem.current.currentTime = track.length * mouseX;

      update({ secondsPlayed: track.length * mouseX });
    }

    if (dragging === 'volume') update({ volume: mouseX });

    setDragging('');
  }, [dragging, track, mouseX]);

  const goPrev = useCallback(() => {
    if (!queue.length) return;

    const payload = [...queue];

    payload.unshift(payload.pop());

    update({ queue: payload });
  }, [queue]);

  const goNext = useCallback(() => {
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
  }, [queue, shuffle]);

  const playedProgress = useMemo(() => {
    if (!track) return 0;

    if (dragging === 'played') return mouseX * 100;

    return (secondsPlayed / track.length) * 100;
  }, [track, mouseX, secondsPlayed]);

  const fullSeconds = useMemo(() => {
    if (dragging !== 'played') return Math.floor(secondsPlayed);

    return Math.floor((track.length * playedProgress) / 100);
  }, [dragging, secondsPlayed, playedProgress, track]);

  const volumeProgress = useMemo(() => {
    if (dragging === 'volume') return mouseX * 100;

    return volume * 100;
  }, [dragging, mouseX, volume]);

  useEffect(() => {
    if (!track) return;

    audioElem.current.setAttribute('src', track.url);

    update({ secondsPlayed: 0 });

    audioElem.current.play();
  }, [track?.id]);

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
  }, []);

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
