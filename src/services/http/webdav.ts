import { Omit } from "type-zoo/types";
import { v4 as uuid } from 'uuid';
import { inject, injectable } from "inversify";
import { HostPrefixHandler } from "../../hooks/hostPrefix";
import { HttpService, HttpOptions } from './http';
import { DownloadProgressStatus } from './progressStatus';
import { TYPES } from '../../types';
const isNode = require('is-node');

export interface WebdavNoProgressOptions extends Omit<HttpOptions, 'url' | 'method' | 'downloadProgress' | 'uploadProgress'> {
    actionId?: string;
}

export interface WebdavProgressOptions extends WebdavNoProgressOptions {
    progress?: boolean;
}

export class GetRequestError extends Error {
    get userMessage() {
        if (typeof this.statusErr === 'number') {
            if (this.statusErr === 404) {
                return `The file ${this.path} could not be found.`;
            }
            if (this.statusErr.toString()[0] === '5') {
                return `The neonious one failed to load the file ${this.path}.`;
            }
        } else {
            return `The file ${this.path} could not be loaded. It may be corrupted.`;
        }
        return `The file ${this.path} could not be loaded.`;
    }

    constructor(public readonly path: string, private statusErr: any) {
        super(`GET: ${path} returned status code or error: ${statusErr}.`); // 'Error' breaks prototype chain here
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    }
}

export function getRequestFileNotFound(path: string): GetRequestError {
    return new GetRequestError(path, 404);
}

export function statusCodeToError(path: string, status: number): GetRequestError | null {
    if (status.toString()[0] !== '2')
        return new GetRequestError(path, status);
    return null;
}

export function errorToError(path: string, err: any): GetRequestError {
    return new GetRequestError(path, err);
}

export interface WebdavService {
    readonly clientId: string;
    findBinaryFile(path: string, options?: WebdavProgressOptions): Promise<{ status: number, data: Uint8Array } | GetRequestError>;
    putBinaryFile(path: string, data: Uint8Array | Blob, options?: WebdavNoProgressOptions): Promise<number>;
    deleteFile(path: string, options?: WebdavNoProgressOptions): Promise<number>;
    createDirectory(path: string, options?: WebdavNoProgressOptions): Promise<number>;
    moveFile(from: string, to: string, overwrite?: boolean): Promise<void>
    copyFile(from: string, to: string, overwrite?: boolean): Promise<void>;
}

@injectable()
export class WebdavServiceImpl implements WebdavService {

    readonly clientId = uuid();

    constructor(
        @inject(TYPES.HttpService) private httpService: HttpService,
        @inject(TYPES.HostPrefixHandler) private hostPrefixHandler: HostPrefixHandler,
        @inject(TYPES.DownloadProgressStatus) private downloadProgressStatus: DownloadProgressStatus
    ) { }

    private get url() {
        return `${this.hostPrefixHandler.hostPrefix}/fs`;
    }

    private ajax({ actionId, ...options }: HttpOptions & { actionId?: string }) {
        const actionIdHeader = actionId ? { ActionID: actionId } : undefined;
        return this.httpService.send({
            ...options,
            headers: {
                ...options.headers,
                ClientID: this.clientId,
                ...actionIdHeader
            }
        });
    }

    findBinaryFile(path: string, { progress, ...rest }: WebdavProgressOptions = {}) {
        const { progressDownload, requestPromise } = this.ajax({
            downloadProgress: progress,
            method: 'GET',
            url: `${this.url}${path}`,
            arrayBufferResponse: true,
            isSuccessFilter: r => true,
            ...rest
        });
        if (progressDownload) {
            this.downloadProgressStatus.postProgress(progressDownload);
        }
        return requestPromise.then(({ status, arrayBuffer }) => {
            if (status !== 404 && status.toString()[0] !== '2') {
                console.warn('GET', path, 'status code', status);
            }
            return statusCodeToError(path, status) || { status, data: new Uint8Array(arrayBuffer) }
        }).catch(e => {
            console.warn('GET', path, 'error', e);
            return errorToError(path, e);
        });
    }

    putBinaryFile(path: string, data: Uint8Array | Blob, { ...rest }: WebdavNoProgressOptions = {}) {
        if (!isNode)
            data = data instanceof Blob ? data : new Blob([data]); // merken: wenn man uint8array hochlädt, blockiert der browser (zumindest chrome)
        const { requestPromise } = this.ajax({
            method: 'PUT',
            url: `${this.url}${path}`,
            params: data,
            headers: {
                "Content-Type": "application/octet-stream"
            },
            isSuccessFilter: r => !!r && r.status.toString()[0] === '2',
            ...rest
        });

        return requestPromise.then(xhr => xhr.status)
    }

    deleteFile(path: string, options: WebdavNoProgressOptions = {}) {
        const { requestPromise } = this.ajax({
            method: 'DELETE',
            url: `${this.url}${path}`,
            isSuccessFilter: r => !!r && r.status.toString()[0] === '2',
            ...options
        });

        return requestPromise.then(xhr => xhr.status)
    }

    createDirectory(path: string, options: WebdavNoProgressOptions = {}) {
        const { requestPromise } = this.ajax({
            method: 'MKCOL',
            url: `${this.url}${path}`,
            isSuccessFilter: r => !!r && r.status.toString()[0] === '2',
            ...options
        });

        return requestPromise.then(xhr => xhr.status)
    }

    async moveFile(from: string, to: string, overwrite = false) {
        const { requestPromise } = this.ajax({
            method: 'MOVE',
            url: `${this.url}${from}`,
            headers: {
                "Overwrite": overwrite ? 'T' : 'F',
                "Destination": `${this.url}${to}`
            },
            isSuccessFilter: r => !!r && r.status.toString()[0] === '2',
        });

        await requestPromise;
    }

    async copyFile(from: string, to: string, overwrite = false) {
        const { requestPromise } = this.ajax({
            method: 'COPY',
            url: `${this.url}${from}`,
            headers: {
                "Overwrite": overwrite ? 'T' : 'F',
                "Destination": `${this.url}${to}`
            },
            isSuccessFilter: r => !!r && r.status.toString()[0] === '2',
        });

        await requestPromise;
    }
}
