import { HttpMiddleware } from "../middleware";
import { HttpHandler } from "../../handler/handler";
import { HttpLoadingHandler } from "../../../../hooks/httpLoading";
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../../types';

@injectable()
export class LoadingMiddlewareImpl implements HttpMiddleware {
    private loadingNum = 0;

    constructor(
        @inject(TYPES.HttpLoadingHandler) private loadingHandler: HttpLoadingHandler
    ) { }

    before(options: HttpHandler.Options) {
        this.loadingNum++;
        if (this.loadingNum === 1) {
            this.loadingHandler.setLoadingState(true);
        }
        return options;
    }
    after(response: HttpHandler.Response | null, error: any, options: HttpHandler.Options) {
        this.loadingNum--;
        if (this.loadingNum === 0) {
            this.loadingHandler.setLoadingState(false);
        }
    }
}