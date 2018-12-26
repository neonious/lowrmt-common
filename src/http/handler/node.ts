import * as http from "http";
import * as https from "https";
import { HttpHandler } from "./handler";
import * as request from "request-promise-native";

const httpsPool = new https.Agent({
  keepAlive: true,
  rejectUnauthorized: false
});
const httpPool = new http.Agent({ keepAlive: true });

export function sendNode(options: HttpHandler.Options) {
  const {
    method,
    url,
    params,
    headers,
    timeout,
    arrayBufferResponse
  } = options;

  const encoding = arrayBufferResponse ? null : undefined; // https://stackoverflow.com/questions/37703518/how-to-post-binary-data-in-request-using-request-library
  
  return (request({
      method,
      agent: url.startsWith("https") ? httpsPool : httpPool,
      uri: url,
      headers,
      timeout,
      body: params,
      encoding,
      resolveWithFullResponse: true
    })
      .then(response => {
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
          get headers() {
            return response.headers;
          }
        };
      })
      .catch(e => {
        const code = e.statusCode;
        if (e.name !== "StatusCodeError") {
          throw e;
        }
        return {
          get status() {
            return code;
          },
          get responseText() {
            throw new Error("responseText not available");
          },
          get arrayBuffer() {
            throw new Error("arrayBuffer not available");
          },
          get headers() {
            throw new Error("headers not available");
          }
        };
      })) as HttpHandler.Result;
}
