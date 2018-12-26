// import { forOwn, size } from 'lodash';
// import { v4 as uuidv4 } from 'uuid';
// import { HttpHandler } from './handler/handler';
// import { injectable, inject } from 'inversify';
// import { DownloadProgressHandler } from '../../hooks/downloadProgressHandler';
// import { TYPES } from '../types';
// import {empty} from 'rxjs/observable/empty';
// import { Observable} from 'rxjs/Observable';
// import {publish} from 'rxjs/operators/publish';
// import {throttleTime} from 'rxjs/operators/throttleTime';
// import {finalize} from 'rxjs/operators/finalize';
// import {catchError} from 'rxjs/operators/catchError';
// import {defaultIfEmpty} from 'rxjs/operators/defaultIfEmpty';
// import { ConnectableObservable } from 'rxjs/observable/ConnectableObservable';

// export interface DownloadProgressStatus {
//     postProgress(progress: Observable<HttpHandler.Progress>): void;
// }

// @injectable()
// export class DownloadProgressStatusImpl implements DownloadProgressStatus {
//     private allProgress: Dict<HttpHandler.Progress> = {};

//     constructor(
//         @inject(TYPES.DownloadProgressHandler) private downloadProgressHandler: DownloadProgressHandler
//     ) { }

//     private calcProgress = () => {
//         let loaded = 0;
//         let total = 0;
//         let indeterminate = false;
//         forOwn(this.allProgress, p => {
//             if (p.indeterminate) {
//                 this.downloadProgressHandler.setProgressStatus(p);
//                 indeterminate = true;
//                 return false;
//             } else {
//                 loaded += p.loaded!;
//                 total += p.total!;
//             }
//         });
//         if (!indeterminate)
//             this.downloadProgressHandler.setProgressStatus({ loaded, total, indeterminate: false });
//     }

//     postProgress(progress: Observable<HttpHandler.Progress>) {
//         const observable = progress.pipe(publish()) as ConnectableObservable<HttpHandler.Progress>;

//         const id = uuidv4();

//         observable
//             .pipe(throttleTime(100))
//             .pipe(finalize(() => {
//                 delete this.allProgress[id];
//                 if (!size(this.allProgress)) {
//                     this.downloadProgressHandler.setProgressStatusVisible(false);
//                 } else
//                     this.calcProgress();
//             }))
//             .pipe(catchError(e => empty()))
//             .subscribe(p => {
//                 if (!size(this.allProgress))
//                     this.downloadProgressHandler.setProgressStatusVisible(true);
//                 this.allProgress[id] = p as any;
//                 this.calcProgress();
//             });

//         const result = observable.pipe(defaultIfEmpty()).toPromise();
//         observable.connect();
//         return result;
//     }
// }