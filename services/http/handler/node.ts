import { Observable, Subject } from "rxjs";
import { isNumber, forOwn } from "lodash";
import * as request from 'request-promise-native';
import { injectable, inject } from "inversify";
import { CancelToken, CancelledError } from "../../../common/cancelToken";
import { HttpHandler } from "./handler";

@injectable()
export class HttpHandlerNode implements HttpHandler {
    send({ method, url, params, headers, timeout, arrayBufferResponse, downloadProgress, uploadProgress, cancelToken }: HttpHandler.Options) {
        // todo vollständiger und besser machen
        const encoding = arrayBufferResponse ? null : undefined; // https://stackoverflow.com/questions/37703518/how-to-post-binary-data-in-request-using-request-library
        return {
            requestPromise: request({
                method,
                uri: url,
                // json: params,
                headers,
                timeout,
                body: params,
                encoding,
                resolveWithFullResponse: true
            }).then(response => {
                return {
                    get status() {
                        return response.statusCode;
                    },
                    get responseText() {
                        return response.body;
                    },
                    get arrayBuffer() {
                        return response.body;
                    }
                }
            }).catch((e) => {
                const code = e.statusCode;
                if (e.name !== 'StatusCodeError') {
                    throw e;
                }
                return {
                    get status() {
                        return code;
                    },
                    get responseText() {
                        throw new Error('responseText not available');
                    },
                    get arrayBuffer() {
                        throw new Error('arrayBuffer not available');
                    }
                }
            })
        } as any as HttpHandler.Result
    }
}

