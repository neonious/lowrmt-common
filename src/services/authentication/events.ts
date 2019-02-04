import { HandlerEventHub } from '@common/common/handlerEvent';

export const beforeLogin = new HandlerEventHub<string>();
export const afterLogin = new HandlerEventHub<string>();
export const beforeLogout = new HandlerEventHub<void>();
export const afterLogout = new HandlerEventHub<void>();