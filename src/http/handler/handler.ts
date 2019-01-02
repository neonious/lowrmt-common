import { CancelToken } from '@common/common/cancelToken';
import { debugLogTime } from '@common/debugVars';
import { McHttpError } from '@common/http/mcHttpError';
// later default timeout options in IOC container

export async function sendHttp(
  options: HttpHandler.Options
): Promise<HttpHandler.Response> {

  const mod = (process.env.TARGETWEB==='true' ? await import('@common/http/handler/web') : await import('@common/http/handler/node')).default;
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
    err?:McHttpError;
    readonly status: number;
    readonly responseText: string;
    readonly arrayBuffer: Uint8Array;
    readonly headers: unknown;
  }

  export const DEFAULT_TIMEOUT = 60000;
}
