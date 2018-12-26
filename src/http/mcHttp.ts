import { Omit } from 'type-zoo/types';
import { v4 } from 'uuid';
import { delay } from '../common/asyncUtil';
import { HttpHandler, sendHttp } from './handler/handler';
import { setTimeoutForId } from '../services/timeout';
import {
  onForbidden,
  getPort,
  getHostNameOrIp,
  getUseSsl
} from '../hooks/forbidden';
import { McHttpError } from './mcHttpError';

interface BaseMcHttpOptions {
  noSession?: boolean;
  reject?: boolean;
}

export interface McHttpOptions extends BaseMcHttpOptions, HttpHandler.Options {}

export interface McHttpJsonOptions
  extends BaseMcHttpOptions,
    Omit<HttpHandler.Options, 'params' | 'method'> {
  json?: unknown;
}

function getHttpHostPrefix(): string {
  const isNode = require('is-node');
  if (!isNode) return '';
  return `${
    getUseSsl() ? 'https' : 'http'
  }://${getHostNameOrIp()}:${getPort()}`;
}

export function isOk(response: HttpHandler.Response) {
  return response.status.toString()[0] === '2';
}

export function isReject(options: Pick<McHttpOptions, 'reject'>) {
  return typeof options.reject === 'undefined' || options.reject;
}


export async function send({ noSession, ...options }: McHttpOptions) {
  let sessionObj;
  if (!noSession) {
    const { getSession } = await import('../services/authentication/session');
    sessionObj = { SessionID: getSession() };
  }
  options = {
    ...options,
    url: `${getHttpHostPrefix()}${options.url}`,
    headers: {
      ...options.headers,
      ...sessionObj
    }
  };

  let start = new Date().getTime();
  const id = v4();
  let response: HttpHandler.Response | undefined;
  // todo timeouterror is only thrown if is web target (not node). also download and upload progress only for web atm
  while (true) {
    try {
      
      response = await sendHttp(options);
    } catch (e) {
      if (e instanceof HttpHandler.TimeoutError) {
        setTimeoutForId(id, true);
        let nextDate = start + 5000;
        let leftTime = nextDate - new Date().getTime();
        if (leftTime > 0) await delay(leftTime);
        start = nextDate;
      } else {
        setTimeoutForId(id, false);
        throw new McHttpError(options, null, e);
      }
    }
    if (response) {
      setTimeoutForId(id, false);
      break;
    }
  }

  if (response.status === 401) {
    onForbidden();
  }

  if (isReject(options) && !isOk(response)) {
    throw new McHttpError(options, response);
  }

  return response;
}

export async function postJson<T>({ url, json, ...rest }: McHttpJsonOptions) {
  const result = await send({
    ...rest,
    method: 'POST',
    url: url,
    params: JSON.stringify(json),
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    reject: true
  });

  try {
    return (result.responseText
      ? JSON.parse(result.responseText)
      : undefined) as T;
  } catch (e) {
    if (e instanceof SyntaxError) {
      console.error('Original JSON: ', result.responseText);
    }
    throw e;
  }
}
