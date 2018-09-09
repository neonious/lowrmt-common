import { HttpHandler } from "../handler/handler";

export interface HttpMiddleware {
    before?(options: HttpHandler.Options): HttpHandler.Options;
    after?(response: HttpHandler.Response | null, error: any, options: HttpHandler.Options): void;
}