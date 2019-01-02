import { HttpHandler } from './handler/handler';

type OnErrorFunc = (
  err: any,
  options: HttpHandler.Options,
  resp?: HttpHandler.Response
) => void;

export let onError: OnErrorFunc | undefined;

export function setHandleMcHttpError(callback: OnErrorFunc) {
  onError = callback;
}
