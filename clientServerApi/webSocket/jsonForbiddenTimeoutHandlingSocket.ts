import { Observable, ReplaySubject, Subject } from 'rxjs';
import { v4 } from 'uuid';
import { ForbiddenHandler } from '../../hooks/forbidden';
import { TimeoutService } from '../../services/timeout';
import { ObservableSocketImpl } from './observableSocket';
import { ForbiddenTimeoutHandlingSocketImpl } from './forbiddenTimeoutHandlingSocket';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../types';

@injectable()
export class JsonForbiddenTimeoutHandlingSocketImpl extends ForbiddenTimeoutHandlingSocketImpl {
    private onMessageSubjectObject = new Subject<string>();
    readonly onMessage3 = this.onMessageSubjectObject.asObservable();

    constructor(
        url: string,
        @inject(TYPES.ForbiddenHandler) forbiddenHandler: ForbiddenHandler,
        @inject(TYPES.TimeoutService) timeoutService: TimeoutService,
        @inject(TYPES.ObservableSocketFactory) socketFactory: (url: string) => ObservableSocketImpl
    ) {
        super(url, forbiddenHandler, timeoutService, socketFactory);

        this.onMessage2.subscribe(json => {
            try {
                const obj = JSON.parse(json);

                this.onMessageSubjectObject.next(obj);
            } catch (e) {
                if (e instanceof SyntaxError) {
                    console.error('Original JSON: ', json);
                }
                throw e;
            }
        }, e => this.onMessageSubjectObject.error(e), () => this.onMessageSubjectObject.complete())
    }

    send(data: any) {
        const json = JSON.stringify(data);
        super.send(json);
    }
}