import { HttpHandler } from "./handler/handler";
import { Omit } from "type-zoo/types";
import { mapValues, merge } from "lodash";
import { HttpService, HttpOptions } from "./http";
import { HostPrefixHandler } from "../../hooks/hostPrefix";
import { HttpApiTypes } from "../../clientServerApi/http/types";
import { injectable, inject } from 'inversify';
import { TYPES } from '../../types';

type NoParams = HttpApiTypes.NoParams;
type FromServer = HttpApiTypes.FromServer;
type ToServer = HttpApiTypes.ToServer;
type Duplex = HttpApiTypes.Duplex;

interface ApiMethodOptions extends Omit<HttpOptions, 'method' | 'params' | 'url'> {
}

interface CustomApiMethodOptions extends ApiMethodOptions {
    readonly apiMethod: keyof ApiMethods;
    readonly params?: object;
}

type ApiMethods = {
    [K in NoParams]: (options?: ApiMethodOptions) => Promise<void>;
} & {
        [K in keyof FromServer]: (options?: ApiMethodOptions) => Promise<FromServer[K]>;
    } & {
        [K in keyof ToServer]: (params: ToServer[K], options?: ApiMethodOptions) => Promise<void>;
    } & {
        [K in keyof Duplex]: (params: Duplex[K]['input'], options?: ApiMethodOptions) => Promise<Duplex[K]['output']>;
    }

export type HttpApiService = ApiMethods & {
    customApiCall(options: CustomApiMethodOptions): HttpHandler.Result;
};

@injectable()
export class HttpApiServiceImpl {
    constructor(
        @inject(TYPES.HttpService) private httpService: HttpService,
        @inject(TYPES.HostPrefixHandler) private hostPrefixHandler: HostPrefixHandler
    ) { }

    customApiCall({ apiMethod, params, ...rest }: CustomApiMethodOptions) {
        const opts: HttpOptions = {
            method: 'POST',
            url: `${this.hostPrefixHandler.hostPrefix}/api/${apiMethod}`,
            params: JSON.stringify(params),
            headers: {
                "Content-Type": "application/json;charset=UTF-8"
            }
        }

        return this.httpService.send(merge(opts, rest));
    }
};

const apiMethods = mapValues(HttpApiTypes.allKeys, (t_, k: keyof ApiMethods) => {
    const method = k;
    return async function (this: HttpApiServiceImpl, paramsOpts?: any, _options?: ApiMethodOptions) {
        const params = method in HttpApiTypes.noParameterKeys ? undefined : paramsOpts;
        const opts = method in HttpApiTypes.noParameterKeys ? paramsOpts : _options;
        let result = (await this.customApiCall(merge({ apiMethod: method, params }, opts || {})).requestPromise)!;
        if (method in HttpApiTypes.resultMethods) {
            try {
                return result.responseText ? JSON.parse(result.responseText) : undefined;
            } catch (e) {
                if (e instanceof SyntaxError) {
                    console.error('Original JSON: ', result.responseText);
                }
                throw e;
            }
        }
    }
}) as any as ApiMethods;

Object.assign(HttpApiServiceImpl.prototype, apiMethods);
