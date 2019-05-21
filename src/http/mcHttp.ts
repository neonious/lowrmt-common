import { delay } from "@common/common/asyncUtil";
import { CancelledError } from "@common/common/cancelToken";
import {
  getHostNameOrIp,
  getPort,
  getUseSsl,
  onForbidden,
  onCatchHttpError
} from "@common/hooks/forbidden";
import { HttpHandler, sendHttp } from "@common/http/handler/handler";
import { McHttpError } from "@common/http/mcHttpError";
import { setTimeoutForId } from "@common/services/timeout";
import { Omit } from "type-zoo/types";
import { v4 } from "uuid";
import { HttpLikeOptions } from "./httpLike";

interface BaseMcHttpOptions extends HttpLikeOptions {
  reject?: boolean;
}

export interface McHttpOptions extends BaseMcHttpOptions, HttpHandler.Options {}

export interface McHttpJsonOptions
  extends BaseMcHttpOptions,
    Omit<HttpHandler.Options, 'params' | 'method'> {
  json?: unknown;
}

function getHttpHostPrefix({ ip, port, ssl }: McHttpOptions): string {
  const isNode = require("is-node");
  if (!isNode) return "";
  ip = ip || getHostNameOrIp();
  port = port === undefined ? getPort() : port;
  ssl = ssl === undefined ? getUseSsl() : ssl;
  return `${ssl ? "https" : "http"}://${ip}:${port}`;
}

export function isOk(response: HttpHandler.Response) {
  return response.status.toString()[0] === '2';
}

export function isReject(options: Pick<McHttpOptions, 'reject'>) {
  return typeof options.reject === 'undefined' || options.reject;
}

type BeforeHttpCallback = (options: McHttpOptions) => Promise<McHttpOptions>;
type BeforeEachHttpCallback = (
  options: McHttpOptions
) => Promise<McHttpOptions>;
type HttpSuccessCallback = (
  options: McHttpOptions,
  response: HttpHandler.Response
) => Promise<void>;
type HttpFailCallback = (
  options: McHttpOptions,
  error: McHttpError,
  response?: HttpHandler.Response
) => Promise<McHttpOptions | void>;
type AfterHttpCallback = () => Promise<void>;

let before: BeforeHttpCallback | undefined;
let beforeEach: BeforeEachHttpCallback | undefined;
let success: HttpSuccessCallback | undefined;
let fail: HttpFailCallback | undefined;
let after: AfterHttpCallback | undefined;

export function onBeforeHttp(callback: BeforeHttpCallback) {
  before = callback;
}

export function onBeforeEachHttp(callback: BeforeEachHttpCallback) {
  beforeEach = callback;
}

export function onHttpSuccess(callback: HttpSuccessCallback) {
  success = callback;
}

export function onHttpFail(callback: HttpFailCallback) {
  fail = callback;
}

export function onAfterHttp(callback: AfterHttpCallback) {
  after = callback;
}

export async function send(options: McHttpOptions) {
  const id = v4();
  try {
    options = (before && (await before(options))) || options;

    let response: HttpHandler.Response | undefined;

    let start = new Date().getTime();

    // todo timeouterror is only thrown if is web target (not node). also download and upload progress only for web atm

    async function handleErrorRepeat(err: McHttpError) {
      if (response) response.err = err;
      if (response && response.status === 401) {
        onForbidden();
      }
      if (fail) {
        const newOptions = await fail(options, err, response);
        if (newOptions) {
          options = newOptions;
          return true;
        }
      }
      if (isReject(options)) throw err;
      return false;
    }

    while (true) {
      options = (beforeEach && (await beforeEach(options))) || options;

      const { noSession } = options;

      let sessionObj;
      if (!noSession) {
        const {
          getSession
        } = await import("@common/services/authentication/session");
        sessionObj = { SessionID: getSession() };
      }

      const httpOptions = {
        ...options,
        url: `${getHttpHostPrefix(options)}${options.url}`,
        headers: {
          ...options.headers,
          ...sessionObj,
          ...(options.password !== undefined
            ? { Password: options.password }
            : undefined)
        }
      };

      try {
        response = await sendHttp(httpOptions);
      } catch (e) {
        if (e instanceof HttpHandler.TimeoutError) {
          setTimeoutForId(id, true);
          let nextDate = start + 5000;
          let leftTime = nextDate - new Date().getTime();
          if (leftTime > 0) await delay(leftTime);
          start = nextDate;
        } else if (e instanceof CancelledError) {
          throw e;
        } else {
          const err = new McHttpError(options, null, e);
          if (await handleErrorRepeat(err)) continue;
          throw err;
        }
      }
      if (response) {
        if (isOk(response)) {
          success && (await success(options, response));
        } else {
          if (await handleErrorRepeat(new McHttpError(options, response)))
            continue;
        }
        break;
      }
    }

    return response;
  } catch (e) {
    if (!(e instanceof CancelledError)) {
      await onCatchHttpError(e);
    }
    throw e;
  } finally {
    setTimeoutForId(id, false);
    after && (await after());
  }
}

export async function postJson<T>({ url, json, ...rest }: McHttpJsonOptions) {
  const result = await send({
    ...rest,
    method: 'POST',
    url: url,
    params: JSON.stringify(json),
    headers: {
      ...rest.headers,
      'Content-Type': 'application/json;charset=UTF-8'
    },
    reject: true
  });

  try {
    return (result.responseText
      ? JSON.parse(result.responseText)
      : undefined) as T;
  } catch (e) {
    if (e instanceof SyntaxError) {
      console.error('Original JSON: ', result.responseText);
    }
    throw e;
  }
}
