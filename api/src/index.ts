import http, { IncomingMessage, ServerResponse } from 'http';

import { artists, tracks } from './constants';

http.createServer(handler).listen(8080);

function handler(req: IncomingMessage, res: ServerResponse) {
  res.writeHead(200, headers(req));

  res.end(
    JSON.stringify({
      artists,
      tracks
    })
  );
}

function headers(req: IncomingMessage) {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': req.headers.origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  };
}
