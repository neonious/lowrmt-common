import { forOwn, size } from 'lodash';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { HttpHandler } from './handler/handler';
import { injectable, inject } from 'inversify';
import { DownloadProgressHandler } from '../../hooks/downloadProgressHandler';
import { TYPES } from '../../types';

export interface DownloadProgressStatus {
    postProgress(progress: Observable<HttpHandler.Progress>): void;
}

@injectable()
export class DownloadProgressStatusImpl implements DownloadProgressStatus {
    private allProgress: Dict<HttpHandler.Progress> = {};

    constructor(
        @inject(TYPES.DownloadProgressHandler) private downloadProgressHandler: DownloadProgressHandler
    ) { }

    private calcProgress = () => {
        let loaded = 0;
        let total = 0;
        let indeterminate = false;
        forOwn(this.allProgress, p => {
            if (p.indeterminate) {
                this.downloadProgressHandler.setProgressStatus(p);
                indeterminate = true;
                return false;
            } else {
                loaded += p.loaded!;
                total += p.total!;
            }
        });
        if (!indeterminate)
            this.downloadProgressHandler.setProgressStatus({ loaded, total, indeterminate: false });
    }

    postProgress(progress: Observable<HttpHandler.Progress>) {
        const observable = progress.publish();

        const id = uuidv4();

        observable
            .throttleTime(100)
            .finally(() => {
                delete this.allProgress[id];
                if (!size(this.allProgress)) {
                    this.downloadProgressHandler.setProgressStatusVisible(false);
                } else
                    this.calcProgress();
            })
            .catch(e => Observable.empty())
            .subscribe(p => {
                if (!size(this.allProgress))
                    this.downloadProgressHandler.setProgressStatusVisible(true);
                this.allProgress[id] = p as any;
                this.calcProgress();
            });

        const result = observable.defaultIfEmpty().toPromise();
        observable.connect();
        return result;
    }
}