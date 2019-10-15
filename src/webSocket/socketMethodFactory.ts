import { HttpLikeOptions } from '../http/httpLike';
import { getSession } from '../services/authentication/session';
import { ForbiddenTimeoutHandlingSocketImpl } from './forbiddenTimeoutHandlingSocket';
import { getGlobalConsole } from '@common/hooks/forbidden';

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
  if (password !== undefined) {
    q.push(`p=${password}`);
  }
  if (getGlobalConsole()){
    q.push('globalConsole=1');
  }
  const url = `${ssl ? 'wss' : 'ws'}://${ip}:${port}/api/${method}${
    q.length ? `?${q.join('&')}` : ''
  }`;
  return new ForbiddenTimeoutHandlingSocketImpl(url);
}
