import { mkdirp, writeFile } from 'fs-extra';
import { toPairs } from 'lodash';
import { dirname, join } from 'path';
import { FilesFromFolder } from './files';

export async function writeFiles(path: string, files: FilesFromFolder) {
  console.log('writing', path);

  for (const [relPath, content] of toPairs(files)) {
    const fullPath = join(path, relPath);
    await mkdirp(dirname(fullPath));
    await writeFile(fullPath, content);
  }
}
