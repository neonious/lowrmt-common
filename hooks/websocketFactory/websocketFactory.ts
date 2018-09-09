import { IWebSocket } from "../../clientServerApi/webSocket/webSocket";

export interface WebsocketFactory {
    create(url: string): IWebSocket;
}
