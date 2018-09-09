
import { Observable } from "rxjs";
import { ForbiddenHandler } from "../../hooks/forbidden";
import { TimeoutService } from "../../services/timeout";
import { JsonForbiddenTimeoutHandlingSocketImpl } from "./jsonForbiddenTimeoutHandlingSocket";
import { ObservableSocketImpl } from "./observableSocket";
import { injectable, inject } from 'inversify';
import { TYPES } from '../../types';

@injectable()
export class AutoClosingJsonForbiddenTimeoutHandlingSocketImpl extends JsonForbiddenTimeoutHandlingSocketImpl {
    readonly onMessage: Observable<string>;

    constructor(
        url: string,
        @inject(TYPES.ForbiddenHandler) forbiddenHandler: ForbiddenHandler,
        @inject(TYPES.TimeoutService) timeoutService: TimeoutService,
        @inject(TYPES.ObservableSocketFactory) socketFactory: (url: string) => ObservableSocketImpl
    ) {
        super(url, forbiddenHandler, timeoutService, socketFactory);

        this.onMessage = new Observable<string>(subscriber => {
            const subscription = this.onMessage3.subscribe(subscriber);
            return () => {
                subscription.unsubscribe();
                this.close();
            }
        }).publish().refCount();
    }
}
