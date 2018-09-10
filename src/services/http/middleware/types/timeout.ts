import { HttpHandler } from "../../handler/handler";
import { Observable, Subject } from "rxjs";
import { TYPES } from "../../../../types";
import { inject, injectable } from "inversify";
import { TimeoutService } from "../../../timeout";
import { delay } from "../../../../common/asyncUtil";
import { v4 } from 'uuid';

export interface TimeoutMiddleware extends HttpHandler {
}

@injectable()
export class TimeoutMiddlewareImpl implements TimeoutMiddleware {

    constructor(
        @inject(TYPES.HttpHandler) private httpService: HttpHandler,
        @inject(TYPES.TimeoutService) private timeoutService: TimeoutService
    ) { }

    private delegateProgress(obs?: Observable<HttpHandler.Progress>, sub?: Subject<HttpHandler.Progress>) {
        if (sub) {
            obs!.subscribe(sub.next.bind(sub), e => {
                if (!(e instanceof HttpHandler.TimeoutError)) {
                    sub.error(e);
                } else {
                    sub.next({ indeterminate: true })
                }
            });
        }
    }

    send(options: HttpHandler.Options): HttpHandler.Result {
        const { uploadProgress, downloadProgress, ...requestOptions } = options;
        const subjectUpload = uploadProgress ? new Subject<HttpHandler.Progress>() : undefined;
        const subjectDownload = downloadProgress ? new Subject<HttpHandler.Progress>() : undefined;
        let start = new Date().getTime();
        const id = v4();

        return {
            progressDownload: subjectDownload && subjectDownload.asObservable(),
            progressUpload: subjectUpload && subjectUpload.asObservable(),
            requestPromise: (async () => {
                while (true) {
                    try {
                        const { requestPromise, progressDownload, progressUpload } = this.httpService.send(options);
                        this.delegateProgress(progressUpload, subjectUpload);
                        this.delegateProgress(progressDownload, subjectDownload);
                        const request = await requestPromise;
                        subjectUpload && subjectUpload.complete();
                        subjectDownload && subjectDownload.complete();
                        this.timeoutService.setTimeout(id, false);
                        return request;
                    } catch (e) {
                        if (e instanceof HttpHandler.TimeoutError) {
                            console.log('HTTP: TIMEOUT!', options.url);
                            this.timeoutService.setTimeout(id, true);
                            let nextDate = start + 5000;
                            let leftTime = nextDate - new Date().getTime();
                            if (leftTime > 0)
                                await delay(leftTime);
                            start = nextDate;
                        } else {
                            this.timeoutService.setTimeout(id, false);
                            throw e;
                        }
                    }
                }
            })()
        };
    }
}