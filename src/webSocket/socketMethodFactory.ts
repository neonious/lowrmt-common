import { getHostNameOrIp, getPort, getUseSsl } from "../hooks/forbidden";
import { getSession } from "../services/authentication/session";
import { ForbiddenTimeoutHandlingSocketImpl } from "./forbiddenTimeoutHandlingSocket";

function getWebsocketHostPrefix(): string {
  return `${getUseSsl() ? "wss" : "ws"}://${getHostNameOrIp()}:${getPort()}`;
  /*     let prefix = this.hostPrefixHandler.hostPrefix;
        if (!prefix) {
            const wsProtocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
            prefix = `${wsProtocol}//${location.host}`;
        }

      */
}

export function createSocketForMethod(method: string) {
  let prefix = getWebsocketHostPrefix();
  const url = `${prefix}/api/${method}?s=${getSession()}`;
  return new ForbiddenTimeoutHandlingSocketImpl(url);
}
