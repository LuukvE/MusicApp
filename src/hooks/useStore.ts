import { State } from 'src/types';
import { create } from 'zustand';

export default create<State>((set) => ({
  playing: false,
  maximized: false,
  selected: null,
  muted: !!localStorage.getItem('muted'),
  volume: parseFloat(localStorage.getItem('volume') || '0.5'),
  queue: [],
  secondsPlayed: 0,
  playlists: {},
  tracks: {},
  artists: {},
  update: (payload) => set((state) => ({ ...state, ...payload })),
  set: (payload, collection) =>
    set((state) => ({
      ...state,
      [collection]: {
        ...state[collection],
        [payload.id]: payload
      }
    }))
}));
