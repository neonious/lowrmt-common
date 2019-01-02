import { HandlerEventHub } from '@common/common/handlerEvent';

export const beforeLogin = new HandlerEventHub<string>("beforeLogin");
export const afterLogin = new HandlerEventHub<string>("afterLogin");
export const beforeLogout = new HandlerEventHub<void>("beforeLogout");
export const afterLogout = new HandlerEventHub<void>("afterLogout");