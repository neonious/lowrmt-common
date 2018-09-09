import * as WebSocketWs from 'ws';

export interface IWebSocket {
    onopen: (() => void) | null;
    onmessage: ((data: string) => void) | null;
    onerror: (() => void) | null;
    onclose: ((code: number) => void) | null;
    readonly readyState: number;
    close(code?: number, reason?: string): void;
    send(data: string): void;
}
