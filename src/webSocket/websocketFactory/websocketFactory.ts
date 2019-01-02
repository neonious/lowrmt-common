import { IWebSocket } from "../../webSocket/webSocket";
// import { createNode } from "../../webSocket/websocketFactory/node";
// import { createWeb } from "../../webSocket/websocketFactory/web";

export function createWebsocket(url: string): IWebSocket {
  if (process.env.TARGETWEB === "true") {
    return require("../../webSocket/websocketFactory/web").createWeb(url);
  } else
    return require("../../webSocket/websocketFactory/node").createNode(url);
}
