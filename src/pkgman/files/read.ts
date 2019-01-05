import { readFile, Stats } from 'fs-extra';
import { resolve } from 'path';
import { FilesFromFolder } from './files';
import { getFilesRecursive } from '../../common/file/readDirRecursive';

export async function readFilesRecursive(
  root: string,
  skipCallback?: (relPath: string, stat: Stats) => boolean
) {
  const result: FilesFromFolder = {};
  const files = await getFilesRecursive(root, skipCallback);
  for (const relPath of files) {
    const buffer = await readFile(resolve(root, relPath));
    result[relPath] = buffer;
  }
  return result;
}
