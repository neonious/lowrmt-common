import { Observable, Subject } from "rxjs";
import { isNumber, forOwn } from "lodash";
import * as request from 'request-promise-native';
import { injectable, inject } from "inversify";
import { CancelToken, CancelledError } from "../../../common/cancelToken";
// later default timeout options in IOC container
export interface HttpHandler {
    send(options: HttpHandler.Options): HttpHandler.Result;
}

export namespace HttpHandler {
    export interface Progress {
        readonly loaded?: number;
        readonly total?: number;
        readonly indeterminate: boolean;
    }

    export interface Options {
        readonly method: string;
        readonly url: string;
        readonly params?: any;
        readonly headers?: Dict<string>;
        readonly timeout?: number;
        readonly downloadProgress?: boolean;
        readonly uploadProgress?: boolean;
        readonly cancelToken?: CancelToken;
        readonly arrayBufferResponse?: boolean;
    }

    export interface Result {
        readonly progressDownload?: Observable<Progress>;
        readonly progressUpload?: Observable<Progress>;
        readonly requestPromise: Promise<Response>;
    }

    export class TimeoutError extends Error {
        constructor(message?: string) {
            super(message); // 'Error' breaks prototype chain here
            Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
        }
    }

    export interface Response {
        readonly status: number;
        readonly responseText: string;
        readonly arrayBuffer: any;
    }

    export const DEFAULT_TIMEOUT = 60000;
}
