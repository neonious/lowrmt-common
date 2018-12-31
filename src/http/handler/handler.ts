import { CancelToken } from '../../common/cancelToken';
import { debugLogTime } from '../../debugVars';
// later default timeout options in IOC container

export async function sendHttp(
  options: HttpHandler.Options
): Promise<HttpHandler.Response> {
  const isNode = require('is-node');
  const mod = (isNode ? await import('./node') : await import('./web')).default;
  const start = Date.now();
  const result = await mod(options);
  debugLogTime(start, 'HTTP Request', options.method, options.url);
  return result;
}

export namespace HttpHandler {
  export interface Progress {
    readonly loaded?: number;
    readonly total?: number;
    readonly indeterminate: boolean;
  }

  export interface Options {
    readonly method: string;
    readonly url: string;
    readonly params?: unknown;
    readonly headers?: Dict<string>;
    readonly timeout?: number;
    readonly cancelToken?: CancelToken;
    readonly arrayBufferResponse?: boolean;
    downloadProgress?(progress: Progress): void;
    uploadProgress?(progress: Progress): void;
  }

  export interface Result extends Promise<Response> {}

  export class TimeoutError extends Error {
    constructor(message?: string) {
      super(message);
      Object.setPrototypeOf(this, new.target.prototype);
    }
  }

  export interface Response {
    readonly status: number;
    readonly responseText: string;
    readonly arrayBuffer: unknown;
    readonly headers: unknown;
  }

  export const DEFAULT_TIMEOUT = 60000;
}
