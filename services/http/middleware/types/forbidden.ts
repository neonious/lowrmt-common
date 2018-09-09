import { HttpHandler } from "../../handler/handler";
import { ForbiddenHandler } from "../../../../hooks/forbidden";
import { HttpMiddleware } from "../middleware";
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../../types';

export class InvalidSessionError extends Error {
    constructor(message?: string) {
        super(message); // 'Error' breaks prototype chain here
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    }
}

@injectable()
export class ForbiddenMiddlewareImpl implements HttpMiddleware {
    constructor(
        @inject(TYPES.ForbiddenHandler) private forbiddenHandler: ForbiddenHandler
    ) { }

    after(response: HttpHandler.Response | null, error: any, options: HttpHandler.Options) {
        if (response && response.status === 401) {
            this.forbiddenHandler.onForbidden();
            throw new InvalidSessionError('Invalid session.');
        }
    }
}