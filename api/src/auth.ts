import fs from 'fs';
import { IncomingMessage, ServerResponse } from 'http';
import { nanoid } from 'nanoid';
import fetch from 'node-fetch';
import path from 'path';
import qs from 'querystring';

import { GoogleUser } from '../../types';
import db from './db';
import { err } from './utils';

const redirectHTML = fs.readFileSync(path.join(__dirname, 'redirect.html'), 'utf-8');

export async function signin(req: IncomingMessage, res: ServerResponse) {
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

  db.users[user.id] = user;

  const session = {
    id: nanoid(),
    user: user.id
  };

  db.sessions[session.id] = session;

  res.writeHead(200, { 'Content-Type': 'text/html' });

  res.end(redirectHTML.replace('SESSION_ID', session.id));
}

export function redirect(res: ServerResponse) {
  res.writeHead(302, {
    Location: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(process.env.GOOGLE_CLIENT)}&redirect_uri=${encodeURIComponent('http://localhost:8080/api/google')}&access_type=offline&response_type=code&scope=${encodeURIComponent(
      ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'].join(' ')
    )}`
  });

  res.end();
}
