import { Omit } from 'type-zoo/types';
import { v4 as uuid } from 'uuid';
import { HttpHandler } from './handler/handler';
import { isOk, isReject, McHttpOptions, send } from './mcHttp';
import { McHttpError } from './mcHttpError';
const isNode = require('is-node');

export interface WebdavNoProgressOptions
  extends Omit<McHttpOptions, 'url' | 'method'> {
  actionId?: string;
}

interface RejectOptions {
  rejectMsg: string;
  rejectCondition: (result: HttpHandler.Response) => boolean;
}

export const clientId = uuid();
const fsPrefix = '/fs';

async function ajax({
  actionId,
  ...options
}: McHttpOptions & {
  actionId?: string;
} & RejectOptions) {
  let response: HttpHandler.Response | undefined;
  const actionIdHeader = actionId ? { ActionID: actionId } : undefined;
  const newOptions = {
    ...options,
    headers: {
      ...options.headers,
      ClientID: clientId,
      ...actionIdHeader
    },
    reject: false
  };
  response = await send(newOptions);
  if (options.rejectCondition(response)) {
    const err = new McHttpError(
      newOptions,
      response,
      undefined,
      options.rejectMsg
    );
    response.err = err;
    if (isReject(options)) throw err;
  } else {
    response.err = undefined;
  }
  return response;
}

function findBinaryFileInternal(
  path: string,
  options: WebdavNoProgressOptions & RejectOptions
) {
  return ajax({
    method: 'GET',
    url: `${fsPrefix}${path}`,
    arrayBufferResponse: true,
    ...options
  });
}

export function getFile(path: string, options: WebdavNoProgressOptions = {}) {
  return findBinaryFileInternal(path, {
    ...options,
    rejectMsg: `The file ${path} could not be loaded.`,
    rejectCondition: resp => !isOk(resp)
  });
}

export function findFile(path: string, options: WebdavNoProgressOptions = {}) {
  return findBinaryFileInternal(path, {
    ...options,
    rejectMsg: `Error requesting file ${path}.`,
    rejectCondition: resp => !isOk(resp) && resp.status !== 404
  });
}

export function putFile(
  path: string,
  data: Uint8Array | Blob,
  options: WebdavNoProgressOptions = {}
) {
  if (!isNode) data = data instanceof Blob ? data : new Blob([data]); // merken: wenn man uint8array hochlädt, blockiert der browser (zumindest chrome)
  return ajax({
    method: 'PUT',
    url: `${fsPrefix}${path}`,
    params: data,
    headers: {
      'Content-Type': 'application/octet-stream'
    },
    ...options,
    rejectMsg: `Could not upload to ${path}.`,
    rejectCondition: resp => !isOk(resp)
  });
}

export function deleteFile(
  path: string,
  options: WebdavNoProgressOptions = {}
) {
  return ajax({
    method: 'DELETE',
    url: `${fsPrefix}${path}`,
    ...options,
    rejectMsg: `Could not delete ${path}.`,
    rejectCondition: resp => !isOk(resp)
  });
}

export function createDirectory(
  path: string,
  options: WebdavNoProgressOptions = {}
) {
  return ajax({
    method: 'MKCOL',
    url: `${fsPrefix}${path}`,
    ...options,
    rejectMsg: `Could not create directory at ${path}.`,
    rejectCondition: resp => !isOk(resp)
  });
}

export function moveFile(from: string, to: string, overwrite = false) {
  return ajax({
    method: 'MOVE',
    url: `${fsPrefix}${from}`,
    headers: {
      Overwrite: overwrite ? 'T' : 'F',
      Destination: `${fsPrefix}${to}`
    },
    rejectMsg: `Could not move from ${from} to ${to}.`,
    rejectCondition: resp => !isOk(resp)
  });
}

export function copyFile(from: string, to: string, overwrite = false) {
  return ajax({
    method: 'COPY',
    url: `${fsPrefix}${from}`,
    headers: {
      Overwrite: overwrite ? 'T' : 'F',
      Destination: `${fsPrefix}${to}`
    },
    rejectMsg: `Could not copy from ${from} to ${to}.`,
    rejectCondition: resp => !isOk(resp)
  });
}
