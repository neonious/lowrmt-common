import * as http from 'http';
import * as https from 'https';
import { injectable } from "inversify";
import * as request from 'request-promise-native';
import { HttpHandler } from "./handler";

export const httpsPool = new https.Agent({keepAlive:true,rejectUnauthorized:false});
export const httpPool = new http.Agent({keepAlive:true});

@injectable()
export class HttpHandlerNode implements HttpHandler {
    send(options: HttpHandler.Options) {
        const { method, url, params, headers, timeout, arrayBufferResponse, downloadProgress, uploadProgress, cancelToken } = options;
        // todo vollständiger und besser machen
        const encoding = arrayBufferResponse ? null : undefined; // https://stackoverflow.com/questions/37703518/how-to-post-binary-data-in-request-using-request-library
        let time=Date.now();
        function logTime(){
            // console.log(`Request for`,method,url,params,'took this long:',(Date.now()-time)/1000,'s!');
        }
        return {
            requestPromise: request({
                method,
                agent: url.startsWith('https') ? httpsPool : httpPool,
                uri: url,
                // json: params,
                headers,
                timeout,
                body: params,
                encoding,
                resolveWithFullResponse: true
            }).then(response => {
                logTime();
                return {
                    get status() {
                        return response.statusCode;
                    },
                    get responseText() {
                        return response.body;
                    },
                    get arrayBuffer() {
                        return response.body;
                    },
                    get headers(){
                        return response.headers;
                    }
                }
            }).catch((e) => {
                logTime();
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
                    },
                    get headers(){
                        throw new Error('headers not available');
                    }
                }
            })
        } as any as HttpHandler.Result
    }
}

