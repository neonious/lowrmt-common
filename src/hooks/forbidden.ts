export function onForbidden(): void {
  _onForbidden && _onForbidden();
}

let _onForbidden: (() => void) | undefined;

export function setOnForbidden(callback: () => void) {
  _onForbidden = callback;
}

let _port = 8443;
export function setPort(port: number) {
  _port = port;
}

let _ip = "192.168.1.1";
export function setHostNameOrIp(ip: string) {
  _ip = ip;
}

let _useSsl = true;
export function setUseSsl(useSsl: boolean) {
  _useSsl = useSsl;
}

export function getPort(): number {
  const isNode = require("is-node");
  if (isNode) return _port;
  if (location.port) {
    return parseInt(location.port);
  }
  return getUseSsl() ? 443 : 80;
}

export function getHostNameOrIp(): string {
  const isNode = require("is-node");
  if (isNode) return _ip;
  return location.hostname;
}

export function getUseSsl(): boolean {
  const isNode = require("is-node");
  return isNode ? _useSsl : location.protocol === "https:";
}
