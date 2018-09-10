import { IWebSocket } from "../../clientServerApi/webSocket/webSocket";
import { injectable } from "inversify";
import { WebsocketFactory } from "./websocketFactory";

@injectable()
export class WebsocketFactoryWeb implements WebsocketFactory {
    create(url: string) {
        const socket = new WebSocket(url);
        return new class implements IWebSocket {
            private msgDel: ((data: string) => void) | null = null;
            private closeDel: ((code: number) => void) | null = null;
            get onopen() {
                return socket.onopen as any;
            }
            set onopen(value: (() => void) | null) {
                socket.onopen = value;
            }
            get onmessage() {
                return this.msgDel;
            }
            set onmessage(value: ((data: string) => void) | null) {
                this.msgDel = value;
                socket.onmessage = value ? ev => {
                    value(ev.data)
                } : null;
            }
            get onerror() {
                return socket.onerror as any;
            }
            set onerror(value: (() => void) | null) {
                socket.onerror = value;
            }
            get onclose() {
                return this.closeDel;
            }
            set onclose(value: ((code: number) => void) | null) {
                this.closeDel = value;
                socket.onclose = value ? ev => {
                    value(ev.code)
                } : null;
            }
            get readyState() {
                return socket.readyState;
            }
            close(code?: number | undefined, reason?: string | undefined): void {
                socket.close(code, reason);
            }
            send(data: string): void {
                socket.send(data);
            }
        }
    }
}