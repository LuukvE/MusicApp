import 'dotenv/config';
import http, { IncomingMessage, ServerResponse } from 'http';
import { nanoid } from 'nanoid';
import fetch from 'node-fetch';
import qs from 'querystring';

import { GoogleUser } from '../../types';
import { artists, tracks } from './constants';

http.createServer(handler).listen(8080);

const fakeDatabase = { users: {} as any, sessions: {} as any };

function handler(req: IncomingMessage, res: ServerResponse) {
  res.writeHead(200, headers(req));

  console.log(req.headers.authorization)

  if (req.url.indexOf('/google/sign-in') === 0) return redirect(res);

  if (req.url.indexOf('/api/google') === 0) return signin(req, res);

  res.end(
    JSON.stringify({
      artists,
      tracks
    })
  );
}

async function signin(req: IncomingMessage, res: ServerResponse) {
  const { code } = qs.parse(req.url.split('?').pop());

  const raw = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: JSON.stringify({
      code,
      client_id: process.env.GOOGLE_CLIENT,
      client_secret: process.env.GOOGLE_SECRET,
      redirect_uri: 'http://localhost:8080/api/google',
      grant_type: 'authorization_code'
    })
  });

  if (raw.status !== 200) return err(res);

  const json = (await raw.json()) as null | { id_token?: string };

  if (!json.id_token) return err(res);

  const info = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(json.id_token)}`);

  if (info.status !== 200) return err(res);

  const data = (await info.json()) as null | GoogleUser;

  if (!data.email || data.email_verified !== 'true') return err(res);

  const email = data.email.toLowerCase();

  const user = {
    id: nanoid(),
    email,
    picture: data.picture || '',
    name: data.name || ''
  };

  fakeDatabase.users[user.email] = user;

  const session = {
    id: nanoid(),
    user: user.id
  };

  fakeDatabase.sessions[session.id] = session;

  res.writeHead(302, { Location: `shower://${session.id}` });

  res.end();
}

function err(res: ServerResponse) {
  res.writeHead(418, { 'Content-Type': 'plain/text' });
  res.end('An error has occurred');
}

function redirect(res: ServerResponse) {
  res.writeHead(302, {
    Location: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(process.env.GOOGLE_CLIENT)}&redirect_uri=${encodeURIComponent('http://localhost:8080/api/google')}&access_type=offline&response_type=code&scope=${encodeURIComponent(
      ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'].join(' ')
    )}`
  });

  res.end();
}

function headers(req: IncomingMessage) {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': req.headers.origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  };
}
