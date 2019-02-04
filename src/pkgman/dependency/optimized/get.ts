import { mkdirp, writeFile, pathExists } from 'fs-extra';
import { dirname } from 'path';
import * as lockfile from 'proper-lockfile';
import {
  tryGetOptimizedDependencyFromCache,
  getCacheDir,
  setOptimizedDependency
} from './cache';
import { createOptimizedDependency } from './create';

export async function getOrCreateOptimizedDependency(
  name: string,
  version: string,
  originalContentPath: string
) {
  let result = await tryGetOptimizedDependencyFromCache(name, version);
  if (!result) {
    const dir = getCacheDir(name, version);
    await mkdirp(dirname(dir));
    const file = `${dir}.lock`;
    if (!(await pathExists(file))) await writeFile(file, '');
    const release = await lockfile.lock(file, {
      retries: { retries: 360, maxTimeout: 1000, minTimeout: 100, factor: 2 }
    } as any);
    try {
      result = await tryGetOptimizedDependencyFromCache(name, version);
      if (!result) {
        result = await createOptimizedDependency(originalContentPath);
        await setOptimizedDependency(name, version, result);
      }
    } finally {
      await release();
    }
  }
  return result;
}
