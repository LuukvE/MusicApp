import { create } from 'zustand';

import { State } from '../../../types';

export default create<State>((set) => ({
  playing: false,
  maximized: false,
  selected: null,
  muted: !!localStorage.getItem('muted'),
  shuffle: false,
  repeat: 'none',
  volume: parseFloat(localStorage.getItem('volume') || '0.5'),
  queue: [],
  secondsPlayed: 0,
  playlists: {},
  session: null,
  users: {},
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
