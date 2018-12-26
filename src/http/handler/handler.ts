import { CancelToken } from "../../common/cancelToken";
// later default timeout options in IOC container

export async function sendHttp(
  options: HttpHandler.Options
): Promise<HttpHandler.Response> {
  const isNode = require("is-node");
  if (isNode) {
    const { sendNode } = await import("./node");
    return await sendNode(options);
  }
  const { sendWeb } = await import("./web");
  return await sendWeb(options);
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
