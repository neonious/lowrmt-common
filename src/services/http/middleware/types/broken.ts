import { HttpMiddleware } from "../middleware";
import { HttpHandler } from "../../handler/handler";
import { BrokenHandler } from "../../../../hooks/broken";
import { injectable, inject } from "inversify";
import { TYPES } from '../../../../types';
import { CancelledError } from '../../../../common/cancelToken';

export class BrokenError extends Error {
    constructor(message?: string) {
        super(message); // 'Error' breaks prototype chain here
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    }
}

export interface BrokenMiddlewareOptions extends HttpHandler.Options {
    isSuccessFilter?(reponse: HttpHandler.Response | null, error: any): boolean;
}

@injectable()
export class BrokenMiddlewareImpl implements HttpMiddleware {
    constructor(
        @inject(TYPES.BrokenHandler) private brokenHandler: BrokenHandler
    ) { }

    after(response: HttpHandler.Response | null, error: any, options: BrokenMiddlewareOptions) {
        const { isSuccessFilter, headers, method, url } = options;
        if (!(error && error instanceof CancelledError) && (error || (response && response.status.toString()[0] !== '2')) && (!isSuccessFilter || !isSuccessFilter(response, error))) {
            this.brokenHandler.setToBroken(response, error, options);
            throw new BrokenError(`Broken http: ${JSON.stringify({ method, headers, url, status: response && response.status, error }, null, 4)}`);
        }
    }
}