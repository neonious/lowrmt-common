import { HttpHandler } from "../services/http/handler/handler";

export interface DownloadProgressHandler {
    setProgressStatus(progress: HttpHandler.Progress): void;
    setProgressStatusVisible(visible: boolean): void;
}