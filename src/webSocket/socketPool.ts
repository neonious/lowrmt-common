import { Observable } from 'rxjs/Observable';
import { getHostNameOrIp, getPort, getUseSsl } from '../hooks/forbidden';
import { afterLogout } from '../services/authentication/events';
import { createSocketForMethod, MethodWebsocketOptions } from './socketMethodFactory';
import { DuplexStreams } from './types/types';

export interface Base {
  readonly onNewSocket: Observable<void>;
  readonly afterSocket: Observable<void>;
  readonly onOpen: Observable<void>;
  readonly onError: Observable<void>;
  readonly onClose: Observable<number>;
}

export interface FromServer<TFrom> extends Base {
  readonly onMessage: Observable<TFrom>;
  close(): void;
}

export interface Duplex<TTo, TFrom> extends Base {
  readonly onMessage: Observable<TFrom>;
  send(data: TTo): void;
  close(): void;
}

type WebsocketApi = {
  [K in keyof DuplexStreams]: DuplexStreams[K] extends {
    toServer: any;
    fromServer: any;
  }
    ? Duplex<DuplexStreams[K]['toServer'], DuplexStreams[K]['fromServer']>
    : DuplexStreams[K] extends { fromServer: any }
    ? FromServer<DuplexStreams[K]['fromServer']>
    : never
};

let streams: Dict<any> = {};

afterLogout.add(() => {
  streams = {};
});

type BeforeWebsocketCallback = (
  options: MethodWebsocketOptions
) => MethodWebsocketOptions;
type BeforeEachWebsocketCallback = (
  options: MethodWebsocketOptions
) => MethodWebsocketOptions;
type SuccessWebsocketCallback = (options: MethodWebsocketOptions) => void;
type FailWebsocketCallback = (
  options: MethodWebsocketOptions,
  forbidden: boolean
) => MethodWebsocketOptions | void;

let before: BeforeWebsocketCallback | undefined;
let beforeEach: BeforeEachWebsocketCallback | undefined;
let success: SuccessWebsocketCallback | undefined;
let fail: FailWebsocketCallback | undefined;

export function onBeforeWebsocket(callback: BeforeWebsocketCallback) {
  before = callback;
}

function getApiStreamCached<K extends keyof WebsocketApi>(
  options: MethodWebsocketOptions
): WebsocketApi[K] {
  const method=options.method;
  let socket = streams[method];
  if (!socket) {
    socket = streams[method] = createSocketForMethod(options);
  }
  return socket;
}

export const websocketApi = new Proxy(
  {},
  {
    get: function(target, method: string) {
      let options: MethodWebsocketOptions = {
        ip: getHostNameOrIp(),
        port: getPort(),
        ssl: getUseSsl(),
        method
      };
      options = (before && before(options)) || options;
      let socket;
      do {
        try {
          socket = getApiStreamCached(options);
          if ((socket as any).closed) {
            delete streams[method];
            socket = getApiStreamCached(options);
          }
        } catch (e) {
          if (fail) {
            const newOptions = fail(options, false);
            if (!newOptions) {
              throw e;
            }
            options = newOptions;
          } else {
            throw e;
          }
        }
      } while (!socket);

      return socket;
    }
  }
) as WebsocketApi;
