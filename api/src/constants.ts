import { faker } from '@faker-js/faker';
import { nanoid } from 'nanoid';

import { Artist, ID, Track } from '../../types';

export const artists: Record<ID, Artist> = new Array(10).fill(null).reduce((artists: Record<ID, Artist>) => {
  const artist: Artist = {
    id: nanoid(),
    name: faker.person.fullName()
  };

  artists[artist.id] = artist;

  return artists;
}, {});

const artistList = Object.values(artists);

const lenghts = [0, 40, 133, 160, 181, 153, 185, 164];

export const tracks = new Array(100).fill(null).reduce((tracks: Record<ID, Track>) => {
  const n = faker.number.int({ min: 1, max: 7 });

  const track: Track = {
    id: nanoid(),
    artists:
      Math.random() < 0.2
        ? [faker.helpers.arrayElement(artistList).id, faker.helpers.arrayElement(artistList).id]
        : [faker.helpers.arrayElement(artistList).id],
    length: lenghts[n],
    name: faker.music.songName(),
    url: `/tracks/track${n}.mp3`,
    thumbnail: `/thumbs/thumb${n}.png`,
    description: Math.random() < 0.5 ? faker.lorem.paragraph(1) : ''
  };

  tracks[track.id] = track;

  return tracks;
}, {});
