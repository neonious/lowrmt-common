import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { SessionService } from '../../services/authentication/session';
import { AuthenticationService } from '../../services/authentication/authentication';
import { DuplexStreams, FromServerStreams } from './types/types';
import { AutoClosingJsonForbiddenTimeoutHandlingSocketImpl } from './autoClosingJsonForbiddenTimeoutHandlingSocket';
import { SocketMethodFactory } from './socketMethodFactory';
import { AuthenticationEvents } from '../../hooks/authentication';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../types';

export interface Base {
    readonly onNewSocket: Observable<void>;
    readonly afterSocket: Observable<void>;
    readonly onOpen: Observable<void>;
    readonly onError: Observable<void>;
    readonly onClose: Observable<number>;
}

export interface FromServer<K extends keyof FromServerStreams> extends Base {
    readonly onMessage: Observable<FromServerStreams[K]>;
    close(): void;
}

export interface Duplex<K extends keyof DuplexStreams> extends Base {
    readonly onMessage: Observable<DuplexStreams[K]['fromServer']>
    send(data: DuplexStreams[K]['toServer']): void;
    close(): void;
}

@injectable()
export class SocketPoolFactory {
    private streams: Dict<AutoClosingJsonForbiddenTimeoutHandlingSocketImpl> = {};

    constructor(
        @inject(TYPES.SocketPoolFactorySocketFactory) private socketFactory: SocketMethodFactory,
        @inject(TYPES.AuthenticationEvents) authenticationEvents: AuthenticationEvents
    ) {
        authenticationEvents.afterLogout.add(() => {
            this.streams = {};
        })
    }

    private getApiStreamCached(method: string) {
        let socket = this.streams[method];
        if (!socket) {
            socket = this.streams[method] = this.socketFactory.create(method);
        }
        return socket;
    }

    get<K extends keyof FromServerStreams>(method: K): FromServer<K>;
    get<K extends keyof DuplexStreams>(method: K): Duplex<K>;
    get<K extends keyof (FromServerStreams & DuplexStreams)>(method: K): FromServer<any> | Duplex<any> {
        let cached = this.getApiStreamCached(method);
        if (cached.closed) {
            delete this.streams[method];
            return this.getApiStreamCached(method);
        }
        return cached;
    }
}