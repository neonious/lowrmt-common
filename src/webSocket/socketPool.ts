import { Observable } from "rxjs/Observable";
import { DuplexStreams } from "./types/types";
import { createSocketForMethod } from "./socketMethodFactory";
import { afterLogout } from "../services/authentication/events";

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

type obj = {
  [K in keyof DuplexStreams]: DuplexStreams[K] extends {
    toServer: any;
    fromServer: any;
  }
    ? Duplex<DuplexStreams[K]["toServer"], DuplexStreams[K]["fromServer"]>
    : DuplexStreams[K] extends { fromServer: any }
    ? FromServer<DuplexStreams[K]["fromServer"]>
    : never
};

let streams: Dict<any> = {};

afterLogout.add(() => {
  streams = {};
});

function getApiStreamCached<K extends keyof obj>(method: string): obj[K] {
  let socket = streams[method];
  if (!socket) {
    socket = streams[method] = createSocketForMethod(method);
  }
  return socket;
}

export const websocketApi = new Proxy(
  {},
  {
    get: function(target, method: string) {
      let cached = getApiStreamCached(method);
      if ((cached as any).closed) {
        delete streams[method];
        return getApiStreamCached(method);
      }
      return cached;
    }
  }
) as obj;
