import { Observable, Subject } from "rxjs";
import { isNumber, forOwn } from "lodash";
import * as request from 'request-promise-native';
import { injectable, inject } from "inversify";
import { CancelToken, CancelledError } from "../../../common/cancelToken";
import { HttpHandler } from "./handler";

@injectable()
export class HttpHandlerWeb implements HttpHandler {
    private progressCallback(subject: Subject<HttpHandler.Progress>, ev: ProgressEvent) {
        if (ev.lengthComputable) {
            const { loaded, total } = ev;
            subject.next({
                loaded, total, indeterminate: false
            });
        } else {
            subject.next({
                indeterminate: true
            });
        }
    }

    send(options: HttpHandler.Options): HttpHandler.Result {

        const { method, url, params, headers, timeout, arrayBufferResponse, downloadProgress, uploadProgress, cancelToken } = options;
        const downloadSubject = downloadProgress ? new Subject<HttpHandler.Progress>() : undefined;
        const uploadSubject = uploadProgress ? new Subject<HttpHandler.Progress>() : undefined;


        const requestPromise = new Promise<HttpHandler.Response>((resolve, reject) => {
            const request = new XMLHttpRequest();
            request.overrideMimeType('text/plain');
            request.timeout = isNumber(timeout) ? timeout : HttpHandler.DEFAULT_TIMEOUT;
            request.open(method, url, true);
            forOwn(headers || {}, (v, k) => {
                request.setRequestHeader(k, v);
            });
            if ((!headers || !headers.ClientID) && url.toLowerCase().indexOf('/fs') !== -1) {
                console.error('Client id was not set in headers');
            }
            request.onload = () => {
                
                downloadSubject && downloadSubject.complete();
                uploadSubject && uploadSubject.complete();
                resolve({
                    status: request.status,
                    get responseText() {
                        // need to lazy load because: Failed to read the 'responseText' property from 'XMLHttpRequest': The value is only accessible if the object's 'responseType' is '' or 'text' (was 'arraybuffer').
                        return request.responseText;
                    },
                    arrayBuffer: request.response
                });
            }
            request.onerror = (e) => {
                downloadSubject && downloadSubject.error(e);
                uploadSubject && uploadSubject.error(e);
                reject(e);
            };
            request.onabort = (ev) => {
                const error = new CancelledError();
                downloadSubject && downloadSubject.error(error);
                uploadSubject && uploadSubject.error(error);
                reject(error);
            };
            request.ontimeout = () => {
                const error = new HttpHandler.TimeoutError();
                downloadSubject && downloadSubject.error(error);
                uploadSubject && uploadSubject.error(error);
                reject(error);
            };
            if (downloadSubject) {
                request.onprogress = ev => {
                    this.progressCallback(downloadSubject, ev);
                };
            }
            if (uploadSubject) {
                request.upload.addEventListener('progress', ev => {
                    this.progressCallback(uploadSubject, ev);
                });
            }
            if (arrayBufferResponse) {
                request.responseType = 'arraybuffer'
            }
            try {
                cancelToken && cancelToken.register(() => {
                    request.abort();
                });
                request.send(params);
            } catch (e) {
                reject(e);
            }
        });

        return {
            progressDownload: downloadSubject && downloadSubject.asObservable(),
            progressUpload: uploadSubject && uploadSubject.asObservable(),
            requestPromise
        };
    }
}