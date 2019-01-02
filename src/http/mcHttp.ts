import { Omit } from "type-zoo/types";
import { v4 } from "uuid";
import { delay } from "@common/common/asyncUtil";
import { HttpHandler, sendHttp } from "@common/http/handler/handler";
import { setTimeoutForId } from "@common/services/timeout";
import {
  onForbidden,
  getPort,
  getHostNameOrIp,
  getUseSsl
} from "@common/hooks/forbidden";
import { McHttpError } from "@common/http/mcHttpError";
import { CancelledError } from "@common/common/cancelToken";
import { onError } from '@common/http/onError';

interface BaseMcHttpOptions {
  noSession?: boolean;
  reject?: boolean;
}

export interface McHttpOptions extends BaseMcHttpOptions, HttpHandler.Options {}

export interface McHttpJsonOptions
  extends BaseMcHttpOptions,
    Omit<HttpHandler.Options, "params" | "method"> {
  json?: unknown;
}

function getHttpHostPrefix(): string {
  const isNode = require("is-node");
  if (!isNode) return "";
  return `${
    getUseSsl() ? "https" : "http"
  }://${getHostNameOrIp()}:${getPort()}`;
}

export function isOk(response: HttpHandler.Response) {
  return response.status.toString()[0] === "2";
}

export function isReject(options: Pick<McHttpOptions, "reject">) {
  return typeof options.reject === "undefined" || options.reject;
}

let beforeHttp: Function | undefined;
let afterHttp: Function | undefined;

export function setBeforeMcHttp(callback: Function) {
  beforeHttp = callback;
}

export function setAfterMcHttp(callback: Function) {
  afterHttp = callback;
}

export async function send({ noSession, ...options }: McHttpOptions) {
  beforeHttp && beforeHttp();
  let response: HttpHandler.Response | undefined;
  let sessionObj;
  if (!noSession) {
    const {
      getSession
    } = await import("@common/services/authentication/session");
    sessionObj = { SessionID: getSession() };
  }
  options = {
    ...options,
    url: `${getHttpHostPrefix()}${options.url}`,
    headers: {
      ...options.headers,
      ...sessionObj
    }
  };
  const id = v4();
  try {
    let start = new Date().getTime();

    // todo timeouterror is only thrown if is web target (not node). also download and upload progress only for web atm
    while (true) {
      try {
        response = await sendHttp(options);
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
          throw new McHttpError(options, null, e);
        }
      }
      if (response) {
        break;
      }
    }

    if (response.status === 401) {
      onForbidden();
    }

    if (!isOk(response)) {
      const err = new McHttpError(options, response);
      response.err = err;
      if (isReject(options)) throw err;
    }

    return response;
  } catch (e) {
    if (onError) {
      onError(e, options, response);
    }
    throw e;
  } finally {
    setTimeoutForId(id, false);
    afterHttp && afterHttp();
  }
}

export async function postJson<T>({ url, json, ...rest }: McHttpJsonOptions) {
  const result = await send({
    ...rest,
    method: "POST",
    url: url,
    params: JSON.stringify(json),
    headers: {
      ...rest.headers,
      "Content-Type": "application/json;charset=UTF-8"
    },
    reject: true
  });

  try {
    return (result.responseText
      ? JSON.parse(result.responseText)
      : undefined) as T;
  } catch (e) {
    if (e instanceof SyntaxError) {
      console.error("Original JSON: ", result.responseText);
    }
    throw e;
  }
}
