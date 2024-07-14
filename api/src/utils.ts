import { IncomingMessage, ServerResponse } from 'http';

export function err(res: ServerResponse) {
  res.writeHead(418, { 'Content-Type': 'plain/text' });
  res.end('An error has occurred');
}

export function headers(req: IncomingMessage) {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': req.headers.origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  };
}
