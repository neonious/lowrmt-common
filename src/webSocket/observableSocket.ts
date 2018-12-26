import { Subject } from 'rxjs/Subject';
import { IWebSocket } from "./webSocket";
import { createWebsocket } from './websocketFactory/websocketFactory';

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
        url: string,
    ) {
        const socket = this.socket = createWebsocket(url);

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