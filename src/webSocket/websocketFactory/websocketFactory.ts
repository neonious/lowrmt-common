import { IWebSocket } from "../../webSocket/webSocket";
import { createNode } from "./node";
import { createWeb } from "./web";

export function createWebsocket(url: string): IWebSocket {
  const isNode = require("is-node");
  if (isNode) {
    return createNode(url);
  }
  return createWeb(url);
}
