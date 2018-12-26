import { getStatusText } from 'http-status-codes';
import { HttpHandler } from './handler/handler';

function getStatusTextNoError(status: number) {
  try {
    getStatusText(status);
  } catch {
    return null;
  }
}

export class McHttpError extends Error {
    constructor(
      public readonly options: HttpHandler.Options,
      public readonly response: HttpHandler.Response | null,
      public readonly error?: any,
      msg?: string
    ) {
      super(
        `${msg ? `${msg} ` : ''}Http error: ${options.method} ${options.url}. ${
          error
            ? error.toString()
            : response
            ? ` Returned status code ${response.status}${
                getStatusTextNoError(response.status)
                  ? ` (${getStatusTextNoError(response.status)})`
                  : ''
              }.`
            : ''
        }`
      );
      Object.setPrototypeOf(this, new.target.prototype);
    }
  }