import { TimeoutMiddleware } from "./middleware/types/timeout";
import { BrokenMiddlewareImpl, BrokenMiddlewareOptions } from "./middleware/types/broken";
import { ForbiddenMiddlewareImpl } from "./middleware/types/forbidden";
import { SessionMiddlewareImpl } from "./middleware/types/session";
import { LoadingMiddlewareImpl } from "./middleware/types/loading";
import { HttpMiddleware } from "./middleware/middleware";
import { Observable } from "rxjs";
import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { HttpHandler } from "./handler/handler";

export interface HttpOptions extends BrokenMiddlewareOptions {

}

export interface HttpService {
    send(options: HttpOptions): HttpHandler.Result
}

@injectable()
export class HttpServiceImpl implements HttpService {
    private middlewares: HttpMiddleware[];

    constructor(
        @inject(TYPES.TimeoutMiddleware) private httpTimeoutService: TimeoutMiddleware,
        @inject(TYPES.BrokenMiddleware) private brokenMiddleware: BrokenMiddlewareImpl,
        @inject(TYPES.ForbiddenMiddleware) private forbiddenMiddleware: ForbiddenMiddlewareImpl,
        @inject(TYPES.SessionMiddleware) private sessionMiddleware: SessionMiddlewareImpl,
        @inject(TYPES.LoadingMiddleware) private loadingMiddleware: LoadingMiddlewareImpl) {

        this.middlewares = [loadingMiddleware, sessionMiddleware, forbiddenMiddleware, brokenMiddleware];
    }

    send(options: HttpOptions): HttpHandler.Result {

        for (const m of this.middlewares) {
            options = m.before && m.before(options) || options;
        }

        let { requestPromise, progressDownload, progressUpload } = this.httpTimeoutService.send(options);

        for (const m of this.middlewares) {
            requestPromise = requestPromise
                .then(r => {
                    m.after && m.after(r, null, options);
                    return r;
                })
                .catch(e => {
                    m.after && m.after(null, e, options);
                    throw e;
                });
        }

        return {
            progressDownload: progressDownload ? progressDownload.merge(Observable.defer(() => requestPromise).ignoreElements() as any/*only errors*/) : undefined,
            progressUpload: progressUpload ? progressUpload.merge(Observable.defer(() => requestPromise).ignoreElements() as any/*only errors*/) : undefined,
            requestPromise
        };
    }
}