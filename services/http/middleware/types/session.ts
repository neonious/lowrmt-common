import { HttpMiddleware } from "../middleware";
import { HttpHandler } from "../../handler/handler";
import { SessionService } from "../../../authentication/session";
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../../types';

@injectable()
export class SessionMiddlewareImpl implements HttpMiddleware {
    constructor(
        @inject(TYPES.SessionService) private sessionService: SessionService
    ) { }

    before(options: HttpHandler.Options) {
        const session = this.sessionService.getSessionOrDefault();
        const sessionHeader = session ? { SessionID: session } : undefined;
      
        return {
            ...options,
            headers: {
                ...options.headers,
                ...sessionHeader
            }
        };
    }
} 