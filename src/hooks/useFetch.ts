import { faker } from '@faker-js/faker';
import { nanoid } from 'nanoid';
import { useCallback } from 'react';
import { Artist, ID, Track } from 'src/types';

import useStore from './useStore';

const artists: Record<ID, Artist> = new Array(10).fill(null).reduce((artists: Record<ID, Artist>) => {
  const artist: Artist = {
    id: nanoid(),
    name: faker.person.fullName()
  };

  artists[artist.id] = artist;

  return artists;
}, {});

const artistList = Object.values(artists);

const tracks = new Array(100).fill(null).reduce((tracks: Record<ID, Track>) => {
  const track: Track = {
    id: nanoid(),
    artists:
      Math.random() < 0.2
        ? [faker.helpers.arrayElement(artistList).id, faker.helpers.arrayElement(artistList).id]
        : [faker.helpers.arrayElement(artistList).id],
    length: faker.number.int({ min: 30, max: 600 }),
    name: faker.music.songName(),
    url: '/dreams.mp3',
    thumbnail: Math.random() < 0.5 ? '/thumb.jpg' : '',
    description: Math.random() < 0.5 ? faker.lorem.paragraph(1) : ''
  };

  tracks[track.id] = track;

  return tracks;
}, {});

export default () => {
  const update = useStore((state) => state.update);

  const load = useCallback(() => {
    update({ tracks, artists });
  }, [update]);

  return { load };
};
