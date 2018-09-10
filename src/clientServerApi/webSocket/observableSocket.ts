import { Subject, Observable } from "rxjs";
import { IWebSocket } from "./webSocket";
import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { WebsocketFactory } from '../../hooks/websocketFactory/websocketFactory';

@injectable()
export class ObservableSocketImpl {
    private onOpenSubject = new Subject<void>();
    readonly onOpen = this.onOpenSubject.asObservable();

    private onMessageSubject = new Subject<string>();
    readonly onMessage = this.onMessageSubject.asObservable();

    private onErrorSubject = new Subject<void>();
    readonly onError = this.onErrorSubject.asObservable();

    private onCloseSubject = new Subject<number>();
    readonly onClose = this.onCloseSubject.asObservable();

    public socket: IWebSocket;

    get readyState() {
        return this.socket.readyState;
    }

    constructor(
        private url: string,
        @inject(TYPES.WebsocketFactory) socketFactory: WebsocketFactory
    ) {
        const socket = this.socket = socketFactory.create(url);

        socket.onopen = () => {
            this.onOpenSubject.next();
            this.onOpenSubject.complete();
        };

        socket.onmessage = ev => {
            this.onMessageSubject.next(ev);
        };

        socket.onerror = () => {
            this.onErrorSubject.next();
            socket.close();
        };

        socket.onclose = ev => {
            this.onCloseSubject.next(ev);

            this.onMessageSubject.complete();
            this.onErrorSubject.complete();
            this.onCloseSubject.complete();
        };
    }

    send(message: string) {
        this.socket.send(message);
    }

    close(code?: number, reason?: string) {
        this.socket.close(code, reason);
    }
}