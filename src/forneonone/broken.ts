// import { HttpMiddleware, AfterMiddlewareOptions } from "../middleware";
// import { BrokenHandler } from "../../../../hooks/broken";
// import { injectable, inject } from "inversify";
// import { TYPES } from "../../../../types";
// import { CancelledError } from "../../../../common/cancelToken";
// import { HttpHandler } from "../../../../http/handler/handler";

// export class BrokenError extends Error {
//   constructor(message?: string) {
//     super(message);
//     Object.setPrototypeOf(this, new.target.prototype);
//   }
// }

// export interface BrokenMiddlewareOptions extends HttpHandler.Options {
//   isSuccessFilter?(reponse: HttpHandler.Response, error: any): boolean;
// }

// @injectable()
// export class BrokenMiddlewareImpl implements HttpMiddleware {
//   constructor(
//     @inject(TYPES.BrokenHandler) private brokenHandler: BrokenHandler
//   ) {}

//   after({ response, options, requestError }: AfterMiddlewareOptions) {
//     const { isSuccessFilter, headers, method, url } = options;
//     if (
//       !(requestError && requestError instanceof CancelledError) &&
//       (requestError || (response && response.status.toString()[0] !== "2")) &&
//       (!isSuccessFilter || !isSuccessFilter(response, requestError))
//     ) {
//       this.brokenHandler.setToBroken(response, requestError, options);
//       throw new BrokenError(
//         `Broken http: ${JSON.stringify(
//           { method, headers, url, status: response && response.status, error:requestError },
//           null,
//           4
//         )}`
//       );
//     }
//   }
// }
