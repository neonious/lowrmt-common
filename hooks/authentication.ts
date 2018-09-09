import { HandlerEvent, HandlerEventHub } from "../common/handlerEvent";
import { injectable } from 'inversify';

export interface AuthenticationEvents {
    readonly beforeLogin: HandlerEvent<string>;
    readonly afterLogin: HandlerEvent<string>;
    readonly beforeLogout: HandlerEvent<void>;
    readonly afterLogout: HandlerEvent<void>;
}

@injectable()
export class AuthenticationEventsImpl implements AuthenticationEvents {
    readonly beforeLogin = new HandlerEventHub<string>('beforeLogin');
    readonly afterLogin = new HandlerEventHub<string>('afterLogin');
    readonly beforeLogout = new HandlerEventHub<void>('beforeLogout');
    readonly afterLogout = new HandlerEventHub<void>('afterLogout');
}