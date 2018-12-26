import * as WebSocketWs from "ws";
import { IWebSocket } from "../../webSocket/webSocket";

export function createNode(url: string) {
  const socket = new WebSocketWs(url, { rejectUnauthorized: false });
  return new class implements IWebSocket {
    private msgDel: ((data: string) => void) | null = null;
    private closeDel: ((code: number) => void) | null = null;
    get onopen() {
      return socket.onopen as any;
    }
    set onopen(value: (() => void) | null) {
      socket.onopen = value || (ev => {});
    }
    get onmessage() {
      return this.msgDel;
    }
    set onmessage(value: ((data: string) => void) | null) {
      const del = value || (() => {});
      this.msgDel = del;
      socket.onmessage = ev => {
        del(ev.data as any);
      };
    }
    get onerror() {
      return socket.onerror as any;
    }
    set onerror(value: (() => void) | null) {
      socket.onerror = value || (ev => {});
    }
    get onclose() {
      return this.closeDel;
    }
    set onclose(value: ((code: number) => void) | null) {
      const del = value || (() => {});
      this.closeDel = del;
      socket.onclose = ev => {
        del(ev.code);
      };
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
  }();
}
