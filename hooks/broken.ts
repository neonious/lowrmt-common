import { BrokenMiddlewareOptions } from "../services/http/middleware/types/broken";
import { HttpHandler } from "../services/http/handler/handler";

export interface BrokenHandler {
    setToBroken(reponse: HttpHandler.Response | null, error: any, options: BrokenMiddlewareOptions): void;
}