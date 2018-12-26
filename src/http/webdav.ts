import { Omit } from 'type-zoo/types';
import { v4 as uuid } from 'uuid';
import { HttpHandler } from './handler/handler';
import { isOk, isReject,  McHttpOptions, send } from './mcHttp';
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

const clientId = uuid();
const fsPrefix = '/fs';

async function ajax({
  actionId,
  ...options
}: McHttpOptions & {
  actionId?: string;
} & RejectOptions) {
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
  const result = await send(newOptions);
  if (options.rejectCondition(result) && isReject(options)) {
    throw new McHttpError(newOptions, result, undefined, options.rejectMsg);
  }
  return result;
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

export function getBinaryFile(
  path: string,
  options: WebdavNoProgressOptions = {}
) {
  return findBinaryFileInternal(path, {
    ...options,
    rejectMsg: `Could not get file ${path}.`,
    rejectCondition: resp => !isOk(resp)
  });
}

export function findBinaryFile(
  path: string,
  options: WebdavNoProgressOptions = {}
) {
  return findBinaryFileInternal(path, {
    ...options,
    rejectMsg: `Could not get file ${path}.`,
    rejectCondition: resp => !isOk(resp) && resp.status !== 404
  });
}

export function putBinaryFile(
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
    rejectMsg: `Could not create directory ${path}.`,
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
