export type ID = string;

export type Track = {
  id: ID;
  artists: ID[];
  name: string;
  url: string;
  length: number;
  thumbnail?: string;
  description?: string;
};

export type Artist = {
  id: ID;
  name: string;
  avatar?: string;
};

export type Playlist = {
  id: ID;
  name: string;
  tracks: ID[];
  thumbnail?: string;
};

export type State = {
  playing: boolean;
  maximized: boolean;
  selected: null | ID;
  queue: Track[];
  volume: number;
  muted: boolean;
  secondsPlayed: number;
  tracks: Record<ID, Track>;
  artists: Record<ID, Artist>;
  playlists: Record<ID, Playlist>;
  update: (payload: Partial<State>) => void;
  set: (payload: { id: ID }, collection: 'playlists' | 'tracks' | 'artists') => void;
};
