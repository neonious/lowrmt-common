import { HttpLikeOptions } from '../http/httpLike';
import { getSession } from '../services/authentication/session';
import { ForbiddenTimeoutHandlingSocketImpl } from './forbiddenTimeoutHandlingSocket';

export interface MethodWebsocketOptions extends HttpLikeOptions {
  method: string;
}

export function createSocketForMethod({
  method,
  ip,
  port,
  ssl,
  noSession,
  password
}: MethodWebsocketOptions) {
  let q = [];
  if (!noSession) {
    q.push(`s=${getSession()}`);
  }
  if (password) {
    q.push(`p=${password}`);
  }
  const url = `${ssl ? 'wss' : 'ws'}://${ip}:${port}/api/${method}${
    q.length ? `?${q.join('&')}` : ''
  }`;
  return new ForbiddenTimeoutHandlingSocketImpl(url);
}
