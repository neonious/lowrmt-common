import { readdir, stat, Stats } from 'fs-extra';
import { join } from 'path';

export async function getFilesRecursive(
  root: string,
  skipCallback?: (relPath: string, stat: Stats) => boolean,
  parentRel?: string
): Promise<string[]> {
  const result: string[] = [];
  const files = await readdir(parentRel ? join(root, parentRel) : root);
  for (const file of files) {
    const relPath = parentRel ? join(parentRel, file) : file;
    const fp = join(root, relPath);
    const stats = await stat(fp);
    if (!skipCallback || !skipCallback(relPath, stats)) {
      if (stats.isFile()) {
        result.push(relPath);
      } else {
        result.push(...(await getFilesRecursive(root, skipCallback, relPath)));
      }
    }
  }
  return result;
}
