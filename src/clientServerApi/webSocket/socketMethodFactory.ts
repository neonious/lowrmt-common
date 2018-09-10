import { SessionService } from "../../services/authentication/session";
import { HostPrefixHandler } from "../../hooks/hostPrefix";
import { AutoClosingJsonForbiddenTimeoutHandlingSocketImpl } from "./autoClosingJsonForbiddenTimeoutHandlingSocket";
import { injectable, inject } from 'inversify';
import { TYPES } from '../../types';

export interface SocketMethodFactory<TSocket=AutoClosingJsonForbiddenTimeoutHandlingSocketImpl> {
    create(method: string): TSocket;
}

@injectable()
export class SocketMethodFactoryImpl<TSocket=AutoClosingJsonForbiddenTimeoutHandlingSocketImpl> implements SocketMethodFactory<TSocket>{
    constructor(
        private socketFactory: (url: string) => TSocket,
        @inject(TYPES.SessionService) private sessionService: SessionService,
        @inject(TYPES.HostPrefixHandler) private hostPrefixHandler: HostPrefixHandler
    ) {
    }

    create(method: string) {
        const session = this.sessionService.getSession(); // later assert !!session

        let prefix = this.hostPrefixHandler.hostPrefix;
        if (!prefix) {
            const wsProtocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
            prefix = `${wsProtocol}//${location.host}`;
        }

        const url = `${prefix}/api/${method}?s=${session}`;

        return this.socketFactory(url);
    }
}
