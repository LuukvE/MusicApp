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

export type User = {
  id: ID;
  name: string;
  email: string;
  picture: string;
};

export type Session = {
  id: ID;
  user: ID;
};

export type QueueTrack = Track & {
  first?: boolean;
};

export type Repeat = "none" | "queue" | "track";

export type State = {
  playing: boolean;
  maximized: boolean;
  selected: null | ID;
  queue: QueueTrack[];
  volume: number;
  muted: boolean;
  repeat: Repeat;
  shuffle: boolean;
  secondsPlayed: number;
  session: null | Session;
  users: Record<ID, User>;
  tracks: Record<ID, Track>;
  artists: Record<ID, Artist>;
  playlists: Record<ID, Playlist>;
  update: (payload: Partial<State>) => void;
  set: (
    payload: { id: ID },
    collection: "playlists" | "tracks" | "artists"
  ) => void;
};

export type GoogleUser = {
  email: string;
  email_verified: "true" | "false";
  name: string;
  picture: string;
};
