import 'dotenv/config';
import http, { IncomingMessage, ServerResponse } from 'http';

import { redirect, signin } from './auth';
import { artists, tracks } from './constants';
import db from './db';
import { headers } from './utils';

http.createServer(handler).listen(8080);

function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.url.indexOf('/google/sign-in') === 0) return redirect(res);

  if (req.url.indexOf('/api/google') === 0) return signin(req, res);

  const session = db.sessions[req.headers.authorization];

  res.writeHead(200, headers(req));

  if (!session) return res.end('{}');

  const users = db.users;

  res.end(
    JSON.stringify({
      users,
      tracks,
      artists,
      session
    })
  );
}
