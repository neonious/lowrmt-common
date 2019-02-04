import { forOwn, isNumber } from "lodash";
import { CancelledError } from "../../common/cancelToken";
import { HttpHandler } from "./handler";

function progressCallback(
  callback: (progress: HttpHandler.Progress) => void,
  ev: ProgressEvent
) {
  if (ev.lengthComputable) {
    const { loaded, total } = ev;
    callback({
      loaded,
      total,
      indeterminate: false
    });
  } else {
    callback({
      indeterminate: true
    });
  }
}

export default function sendWeb(
  options: HttpHandler.Options
): HttpHandler.Result {
  const {
    method,
    url,
    params,
    headers,
    timeout,
    arrayBufferResponse,
    downloadProgress,
    uploadProgress,
    cancelToken
  } = options;

  return new Promise<HttpHandler.Response>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.overrideMimeType("text/plain");
    request.timeout = isNumber(timeout) ? timeout : HttpHandler.DEFAULT_TIMEOUT;
    request.open(method, url, true);
    forOwn(headers || {}, (v, k) => {
      request.setRequestHeader(k, v);
    });
    if (
      (!headers || !headers.ClientID) &&
      url.toLowerCase().indexOf("/fs") !== -1
    ) {
      console.error("Client id was not set in headers");
    }
    request.onload = () => {
      resolve({
        status: request.status,
        get responseText() {
          // need to lazy load because: Failed to read the 'responseText' property from 'XMLHttpRequest': The value is only accessible if the object's 'responseType' is '' or 'text' (was 'arraybuffer').
          
          if (!arrayBufferResponse) {
            return request.responseText;
          }
          throw new Error("arrayBufferResponse was set in http options.");
        },
        get arrayBuffer() {
          if (arrayBufferResponse) {
            return new Uint8Array(request.response);
          }
          console.log(url);
          throw new Error("arrayBufferResponse was not set in http options.");
        },
        headers: request.getAllResponseHeaders()
      });
    };
    request.onerror = e => {
      reject(e);
    };
    request.onabort = ev => {
      const error = new CancelledError();
      reject(error);
    };
    request.ontimeout = () => {
      const error = new HttpHandler.TimeoutError();
      reject(error);
    };
    if (downloadProgress) {
      request.onprogress = ev => {
        progressCallback(downloadProgress, ev);
      };
    }
    if (uploadProgress) {
      request.upload.addEventListener("progress", ev => {
        progressCallback(uploadProgress, ev);
      });
    }
    if (arrayBufferResponse) {
      request.responseType = "arraybuffer";
    }
    try {
      cancelToken &&
        cancelToken.register(() => {
          request.abort();
        });
      request.send(params as any);
    } catch (e) {
      reject(e);
    }
  });
}
